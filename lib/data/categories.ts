import { createClient } from '@/lib/supabase/server'

export interface UserCategory {
  id: string
  user_id: string
  name: string
  icon: string | null
  description: string | null
  created_at: string
  updated_at?: string
}

export const PRESET_CATEGORIES: { name: string; icon: string; description: string }[] = [
  { name: 'DSA', icon: '⚡', description: 'Data Structures & Algorithms' },
  { name: 'Web Development', icon: '🌐', description: 'Frontend, Backend & Fullstack Web' },
  { name: 'DBMS', icon: '🗄️', description: 'Database Management Systems & SQL' },
  { name: 'Operating Systems', icon: '🖥️', description: 'OS Concepts, Linux & System Programming' },
  { name: 'Java', icon: '☕', description: 'Java Programming & OOP' },
  { name: 'C++', icon: '⚙️', description: 'C++ Systems & Competitive Programming' },
  { name: 'Mathematics', icon: '📐', description: 'Linear Algebra, Calculus & Discrete Math' },
  { name: 'Projects', icon: '🚀', description: 'Portfolio Projects & Practical Builds' },
  { name: 'Practice', icon: '🧩', description: 'Coding Exercises & Problem Sets' },
  { name: 'Documentation', icon: '📖', description: 'Official Docs & API Guides' },
  { name: 'Course', icon: '🎓', description: 'Online Courses & Tutorials' },
  { name: 'Reference', icon: '📚', description: 'Cheat Sheets & References' },
  { name: 'College', icon: '🏫', description: 'University Syllabus & Class Notes' },
  { name: 'Other', icon: '🔖', description: 'Miscellaneous Resources' },
]

/**
 * Fetches custom categories created by the user from the `user_categories` table
 * and Supabase Auth user metadata fallback.
 */
export async function getUserCategories(userId: string): Promise<UserCategory[]> {
  const result: UserCategory[] = []
  try {
    const supabase = await createClient()

    // 1. Try table
    const { data, error } = await supabase
      .from('user_categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (!error && data) {
      result.push(...(data as UserCategory[]))
    }

    // 2. Also check auth user metadata for fallback custom categories
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.custom_categories && Array.isArray(user.user_metadata.custom_categories)) {
      for (const c of user.user_metadata.custom_categories) {
        if (c && c.name && !result.some((r) => r.name.toLowerCase() === c.name.toLowerCase())) {
          result.push({
            id: c.id || `meta-${c.name}`,
            user_id: userId,
            name: c.name,
            icon: c.icon || null,
            description: c.description || null,
            created_at: c.created_at || new Date().toISOString(),
          })
        }
      }
    }

    return result
  } catch (err) {
    console.error('Error fetching user custom categories:', err)
    return result
  }
}

/**
 * Returns a comprehensive, deduplicated list of all available categories for a user:
 * Preset categories + User custom categories + any categories already assigned to resources/documents.
 */
export async function getAllCategoriesForUser(userId: string): Promise<string[]> {
  const categorySet = new Set<string>()

  // 1. Add preset categories
  for (const p of PRESET_CATEGORIES) {
    categorySet.add(p.name)
  }

  // 2. Add custom user categories
  const custom = await getUserCategories(userId)
  for (const c of custom) {
    categorySet.add(c.name)
  }

  // 3. Add existing categories used on website_resources and documents
  try {
    const supabase = await createClient()
    const [resRes, docRes] = await Promise.all([
      supabase.from('website_resources').select('category').eq('user_id', userId),
      supabase.from('documents').select('category').eq('user_id', userId),
    ])

    if (resRes.data) {
      for (const r of resRes.data) {
        if (r.category && typeof r.category === 'string' && r.category.trim()) {
          categorySet.add(r.category.trim())
        }
      }
    }

    if (docRes.data) {
      for (const d of docRes.data) {
        if (d.category && typeof d.category === 'string' && d.category.trim()) {
          categorySet.add(d.category.trim())
        }
      }
    }
  } catch (err) {
    console.error('Error fetching resource categories for user:', err)
  }

  return Array.from(categorySet)
}

/**
 * Creates a new custom category for the user.
 * Tries `user_categories` table first; if the table is not migrated, falls back to Supabase Auth user metadata.
 */
export async function createUserCategory(
  userId: string,
  input: { name: string; icon?: string | null; description?: string | null }
): Promise<UserCategory> {
  const trimmedName = input.name.trim()
  if (!trimmedName) {
    throw new Error('Category name is required')
  }

  if (trimmedName.length > 50) {
    throw new Error('Category name must be 50 characters or less')
  }

  const supabase = await createClient()
  const newCat: UserCategory = {
    id: `cat-${Date.now()}`,
    user_id: userId,
    name: trimmedName,
    icon: input.icon?.trim() || null,
    description: input.description?.trim() || null,
    created_at: new Date().toISOString(),
  }

  // 1. Try DB table
  try {
    const { data: existing } = await supabase
      .from('user_categories')
      .select('id, name')
      .eq('user_id', userId)
      .ilike('name', trimmedName)

    if (existing && existing.length > 0) {
      throw new Error(`Category "${trimmedName}" already exists.`)
    }

    const { data, error } = await supabase
      .from('user_categories')
      .insert({
        user_id: userId,
        name: trimmedName,
        icon: input.icon?.trim() || null,
        description: input.description?.trim() || null,
      })
      .select()
      .single()

    if (!error && data) {
      return data as UserCategory
    }
  } catch (dbErr: unknown) {
    if (dbErr instanceof Error && dbErr.message.includes('already exists')) {
      throw dbErr
    }
  }

  // 2. Fallback: Save in Auth User Metadata
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const currentCats = (user?.user_metadata?.custom_categories as UserCategory[]) || []
    if (currentCats.some((c) => c.name.toLowerCase() === trimmedName.toLowerCase())) {
      throw new Error(`Category "${trimmedName}" already exists.`)
    }
    const updatedCats = [...currentCats, newCat]
    await supabase.auth.updateUser({
      data: {
        custom_categories: updatedCats,
      },
    })
  } catch (metaErr: unknown) {
    if (metaErr instanceof Error && metaErr.message.includes('already exists')) {
      throw metaErr
    }
    console.error('Error updating user metadata categories:', metaErr)
  }

  return newCat
}

/**
 * Deletes a custom category for the user.
 */
export async function deleteUserCategory(userId: string, categoryId: string): Promise<void> {
  const supabase = await createClient()

  // 1. Try table
  try {
    await supabase
      .from('user_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', userId)
  } catch {}

  // 2. Also remove from Auth metadata
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.user_metadata?.custom_categories) {
      const updatedCats = (user.user_metadata.custom_categories as UserCategory[]).filter(
        (c) => c.id !== categoryId && c.name !== categoryId
      )
      await supabase.auth.updateUser({
        data: {
          custom_categories: updatedCats,
        },
      })
    }
  } catch {}
}

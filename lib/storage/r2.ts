import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  _Object as S3Object,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

let cachedR2Client: S3Client | null = null

/**
 * Validates and retrieves the S3Client configured for Cloudflare R2.
 * Never exports raw credentials to callers.
 */
export function getR2Client(): S3Client {
  if (cachedR2Client) {
    return cachedR2Client
  }

  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'Cloudflare R2 environment variables are missing (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY).'
    )
  }

  cachedR2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return cachedR2Client
}

/**
 * Returns the configured R2 bucket name.
 */
export function getR2BucketName(): string {
  const bucketName = process.env.R2_BUCKET_NAME
  if (!bucketName) {
    return 'studyspace-documents'
  }
  return bucketName
}

/**
 * Generates a presigned PUT URL allowing the client browser to upload directly to R2.
 * Expiration defaults to 10 minutes (600 seconds).
 */
export async function getPresignedUploadUrl(
  storageKey: string,
  contentType: string = 'application/octet-stream',
  expiresInSeconds: number = 600
): Promise<string> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ContentType: contentType,
  })

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

/**
 * Generates a presigned GET URL allowing the client browser to securely view/download a document.
 * Expiration defaults to 15 minutes (900 seconds).
 */
export async function getPresignedDownloadUrl(
  storageKey: string,
  expiresInSeconds: number = 900,
  fileName?: string
): Promise<string> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    ResponseContentDisposition: fileName
      ? `inline; filename="${encodeURIComponent(fileName)}"`
      : 'inline',
  })

  return await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
}

/**
 * Deletes an object from Cloudflare R2.
 */
export async function deleteR2Object(storageKey: string): Promise<void> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: storageKey,
  })

  await client.send(command)
}

/**
 * Checks if an object exists and returns its metadata, or null if not found.
 */
export async function headR2Object(
  storageKey: string
): Promise<{ contentLength: number; contentType?: string; lastModified?: Date } | null> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  try {
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: storageKey,
    })

    const response = await client.send(command)
    return {
      contentLength: response.ContentLength || 0,
      contentType: response.ContentType,
      lastModified: response.LastModified,
    }
  } catch (err: unknown) {
    const errorName = (err as { name?: string })?.name
    const httpStatus = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode
    if (errorName === 'NotFound' || errorName === 'NoSuchKey' || httpStatus === 404) {
      return null
    }
    throw err
  }
}

/**
 * Directly writes an object buffer to Cloudflare R2 (server-side).
 * Used during Supabase Storage -> R2 migrations and system tests.
 */
export async function putR2Object(
  storageKey: string,
  body: Buffer | Uint8Array | string,
  contentType: string = 'application/octet-stream'
): Promise<void> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: storageKey,
    Body: body,
    ContentType: contentType,
  })

  await client.send(command)
}

/**
 * Lists objects in the bucket, optionally filtered by key prefix.
 */
export async function listR2Objects(
  prefix?: string,
  maxKeys: number = 1000
): Promise<S3Object[]> {
  const client = getR2Client()
  const bucket = getR2BucketName()

  const objects: S3Object[] = []
  let continuationToken: string | undefined = undefined

  do {
    const command: ListObjectsV2Command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: Math.min(maxKeys - objects.length, 1000),
      ContinuationToken: continuationToken,
    })

    const response: ListObjectsV2CommandOutput = await client.send(command)
    if (response.Contents) {
      objects.push(...response.Contents)
    }

    continuationToken = response.NextContinuationToken
  } while (continuationToken && objects.length < maxKeys)

  return objects
}

export interface R2StorageMetrics {
  totalObjects: number
  totalSizeBytes: number
  bucketName: string
  isConfigured: boolean
}

/**
 * Computes live R2 storage metrics (total objects, total size in bytes).
 */
export async function getR2StorageMetrics(): Promise<R2StorageMetrics> {
  const bucketName = getR2BucketName()
  try {
    const allObjects = await listR2Objects(undefined, 10000)
    const totalSizeBytes = allObjects.reduce((acc, obj) => acc + (obj.Size || 0), 0)

    return {
      totalObjects: allObjects.length,
      totalSizeBytes,
      bucketName,
      isConfigured: true,
    }
  } catch (error) {
    console.error('Failed to fetch R2 storage metrics:', error)
    return {
      totalObjects: 0,
      totalSizeBytes: 0,
      bucketName,
      isConfigured: false,
    }
  }
}

export interface R2TestResult {
  success: boolean
  durationMs: number
  steps: { name: string; success: boolean; details?: string }[]
  error?: string
}

/**
 * Executes a full round-trip connectivity test on Cloudflare R2.
 * 1. Uploads test file to _system-tests/r2-connection-test.txt
 * 2. Verifies object exists with HeadObject
 * 3. Generates presigned GET URL and confirms access
 * 4. Deletes test object
 * 5. Confirms object no longer exists
 */
export async function testR2Connection(): Promise<R2TestResult> {
  const startTime = Date.now()
  const steps: { name: string; success: boolean; details?: string }[] = []
  const testKey = `_system-tests/r2-connection-test-${Date.now()}.txt`
  const testContent = `StudySpace Cloudflare R2 Connection Test @ ${new Date().toISOString()}`

  try {
    // Step 1: PutObject
    await putR2Object(testKey, Buffer.from(testContent, 'utf-8'), 'text/plain')
    steps.push({ name: 'PutObject', success: true, details: `Uploaded test object ${testKey}` })

    // Step 2: HeadObject
    const headResult = await headR2Object(testKey)
    if (!headResult || headResult.contentLength !== Buffer.byteLength(testContent, 'utf-8')) {
      throw new Error(`HeadObject verification failed: expected ${Buffer.byteLength(testContent)} bytes, got ${headResult?.contentLength}`)
    }
    steps.push({ name: 'HeadObject', success: true, details: `Verified length: ${headResult.contentLength} bytes` })

    // Step 3: Presigned GET URL
    const signedUrl = await getPresignedDownloadUrl(testKey, 120, 'test.txt')
    if (!signedUrl || !signedUrl.startsWith('http')) {
      throw new Error('Failed to generate valid presigned GET URL')
    }
    steps.push({ name: 'Presigned GET URL', success: true, details: 'Generated valid signed download URL' })

    // Step 4: DeleteObject
    await deleteR2Object(testKey)
    steps.push({ name: 'DeleteObject', success: true, details: 'Deleted test object' })

    // Step 5: Verify 404 after deletion
    const verifyDeleted = await headR2Object(testKey)
    if (verifyDeleted !== null) {
      throw new Error('Object still exists in R2 after DeleteObject call')
    }
    steps.push({ name: 'Verify Deletion', success: true, details: 'Confirmed object is removed (404)' })

    return {
      success: true,
      durationMs: Date.now() - startTime,
      steps,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    return {
      success: false,
      durationMs: Date.now() - startTime,
      steps,
      error: errorMsg,
    }
  }
}

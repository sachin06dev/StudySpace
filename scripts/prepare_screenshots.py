import os
import shutil

src_dir = r"d:\studyspace_nextjs\studyspace-assests"
pub_dir = r"d:\studyspace_nextjs\public\screenshots"
light_dir = os.path.join(pub_dir, "light")
dark_dir = os.path.join(pub_dir, "dark")

os.makedirs(light_dir, exist_ok=True)
os.makedirs(dark_dir, exist_ok=True)

# Define exact mapping from source file timestamp to clean semantic filename
# Format: (search_key, light_name, dark_name)
mapping = [
    # Dashboard
    ("09-58-39", "dashboard.png", "light"),
    ("10-12-34", "dashboard.png", "dark"),
    
    # Timetable
    ("09-58-59", "timetable.png", "light"),
    ("10-13-04", "timetable.png", "dark"),
    
    # Attendance Master
    ("09-59-21", "attendance-master.png", "light"),
    ("10-13-30", "attendance-master.png", "dark"),
    
    # Attendance Detail / Log
    ("09-51-01", "attendance-detail.png", "light"),
    ("10-13-55", "attendance-detail.png", "dark"),
    
    # Attendance Top Banner
    ("09-49-33", "attendance-banner.png", "light"),
    ("10-13-39", "attendance-banner.png", "dark"),
    
    # Attendance Card
    ("09-50-32", "attendance-card.png", "light"),
    
    # Study Hub
    ("09-59-38", "study-hub.png", "light"),
    ("10-14-08", "study-hub.png", "dark"),
    
    # Tasks Full
    ("09-59-53", "tasks.png", "light"),
    ("10-14-41", "tasks.png", "dark"),
    
    # Tasks Compact
    ("09-52-05", "tasks-compact.png", "light"),
    ("10-14-32", "tasks-compact.png", "dark"),
    
    # Pomodoro Full
    ("10-00-12", "pomodoro.png", "light"),
    ("10-15-06", "pomodoro.png", "dark"),
    
    # Pomodoro Compact
    ("09-52-21", "pomodoro-compact.png", "light"),
    ("10-14-53", "pomodoro-compact.png", "dark"),
    
    # Notes
    ("09-55-48", "notes.png", "light"),
    ("10-15-16", "notes.png", "dark"),
    
    # Documents Vault
    ("09-56-24", "documents.png", "light"),
    ("10-15-27", "documents.png", "dark"),
    
    # Videos Player with Timestamped Notes
    ("09-56-49", "videos-player.png", "light"),
    ("10-15-52", "videos-player.png", "dark"),
    
    # Videos Grid
    ("09-57-09", "videos-grid.png", "light"),
    ("10-15-41", "videos-grid.png", "dark"),
    
    # Playlists
    ("09-57-25", "playlists.png", "light"),
    ("10-16-04", "playlists.png", "dark"),
    
    # Resources
    ("09-58-11", "resources.png", "light"),
    ("10-16-22", "resources.png", "dark"),
    
    # Analytics Master Page
    ("10-02-49", "analytics-full.png", "light"),
    ("10-18-02", "analytics-full.png", "dark"),
    
    # Analytics Overview Bar
    ("10-01-10", "analytics-overview.png", "light"),
    ("10-16-49", "analytics-overview.png", "dark"),
    
    # Analytics Hours / Velocity Line Chart
    ("10-01-18", "analytics-hours.png", "light"),
    ("10-16-55", "analytics-hours.png", "dark"),
    
    # Analytics Subject Breakdown
    ("10-01-27", "analytics-breakdown.png", "light"),
    ("10-17-00", "analytics-breakdown.png", "dark"),
    
    # Analytics Attendance vs Goal Radar/Donut
    ("10-01-34", "analytics-target.png", "light"),
    ("10-17-06", "analytics-target.png", "dark"),
    
    # Analytics Subject Performance
    ("10-01-45", "analytics-performance.png", "light"),
    ("10-17-13", "analytics-performance.png", "dark"),
    
    # Analytics Consistency Radar
    ("10-02-10", "analytics-consistency.png", "light"),
    ("10-17-23", "analytics-consistency.png", "dark"),
    
    # Analytics Diurnal / Hourly Distribution
    ("10-02-17", "analytics-hourly.png", "light"),
    ("10-17-29", "analytics-hourly.png", "dark"),
    
    # Analytics Milestones / Badges
    ("10-00-30", "analytics-milestone-1.png", "light"),
    ("10-16-31", "analytics-milestone-1.png", "dark"),
    ("10-00-46", "analytics-milestone-2.png", "light"),
    ("10-16-36", "analytics-milestone-2.png", "dark"),
    ("10-00-58", "analytics-milestone-3.png", "light"),
    ("10-16-42", "analytics-milestone-3.png", "dark"),
    ("10-02-29", "analytics-streak.png", "light"),
    ("10-17-36", "analytics-streak.png", "dark"),
    ("10-17-43", "analytics-streak-detail.png", "dark"),
    ("10-18-10", "analytics-streak-detail.png", "light"),
]

all_src_files = os.listdir(src_dir)
copied = 0

for item in mapping:
    search_key, target_name, theme = item
    target_folder = light_dir if theme == "light" else dark_dir
    target_path = os.path.join(target_folder, target_name)
    
    matched = [f for f in all_src_files if search_key in f]
    if matched:
        src_path = os.path.join(src_dir, matched[0])
        shutil.copy2(src_path, target_path)
        copied += 1
        print(f"Copied [{theme}] {matched[0][:40]} -> {target_name}")
    else:
        print(f"WARNING: No match for {search_key}")

print(f"\nSuccessfully copied and organized {copied} screenshots into {pub_dir}")

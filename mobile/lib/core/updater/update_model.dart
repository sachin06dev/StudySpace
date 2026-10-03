class AppReleaseManifest {
  final String latestVersion;
  final int latestBuild;
  final int minimumSupportedBuild;
  final String apkUrl;
  final int apkSize;
  final String sha256;
  final String releaseDate;
  final List<String> releaseNotes;

  const AppReleaseManifest({
    required this.latestVersion,
    required this.latestBuild,
    this.minimumSupportedBuild = 1,
    required this.apkUrl,
    this.apkSize = 0,
    required this.sha256,
    this.releaseDate = '',
    this.releaseNotes = const [],
  });

  factory AppReleaseManifest.fromJson(Map<String, dynamic> json) {
    return AppReleaseManifest(
      latestVersion: json['latestVersion'] as String? ?? '1.0.0',
      latestBuild: (json['latestBuild'] as num?)?.toInt() ?? 1,
      minimumSupportedBuild: (json['minimumSupportedBuild'] as num?)?.toInt() ?? 1,
      apkUrl: json['apkUrl'] as String? ?? '',
      apkSize: (json['apkSize'] as num?)?.toInt() ?? 0,
      sha256: json['sha256'] as String? ?? '',
      releaseDate: json['releaseDate'] as String? ?? '',
      releaseNotes: (json['releaseNotes'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latestVersion': latestVersion,
      'latestBuild': latestBuild,
      'minimumSupportedBuild': minimumSupportedBuild,
      'apkUrl': apkUrl,
      'apkSize': apkSize,
      'sha256': sha256,
      'releaseDate': releaseDate,
      'releaseNotes': releaseNotes,
    };
  }

  /// Determines if an update is available based on numerical build number comparison.
  /// (Prevents incorrect string comparison bugs such as '1.10.0' < '1.9.0')
  bool isUpdateAvailable(int currentBuild) {
    return currentBuild < latestBuild;
  }

  /// Determines if this update is mandatory for continued app operation.
  bool isMandatory(int currentBuild) {
    return currentBuild < minimumSupportedBuild;
  }
}

class InstalledVersionInfo {
  final String versionName;
  final int versionCode;
  final String packageName;

  const InstalledVersionInfo({
    required this.versionName,
    required this.versionCode,
    required this.packageName,
  });

  factory InstalledVersionInfo.fromMap(Map<dynamic, dynamic> map) {
    return InstalledVersionInfo(
      versionName: map['versionName'] as String? ?? '1.0.0',
      versionCode: (map['versionCode'] as num?)?.toInt() ?? 1,
      packageName: map['packageName'] as String? ?? 'com.studyspace.app',
    );
  }

  @override
  String toString() => 'v$versionName (Build $versionCode)';
}

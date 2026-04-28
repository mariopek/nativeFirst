/**
 * Apple's Required Reasons API data for PrivacyInfo.xcprivacy generation.
 *
 * Source: https://developer.apple.com/documentation/bundleresources/privacy_manifest_files/describing_use_of_required_reason_api
 *
 * Updated for the requirements that became mandatory in spring 2024 and
 * have been enforced for new App Store submissions ever since. Apple may
 * add new categories or reasons over time — when they do, add them here.
 */

export interface RequiredReason {
  /** The reason code as Apple defined it, e.g. "CA92.1" */
  code: string;
  /** Plain-English description (1 sentence) */
  description: string;
  /** Concrete example so devs know if it applies to them */
  example: string;
}

export interface RequiredReasonCategory {
  /** Apple's full category constant, e.g. "NSPrivacyAccessedAPICategoryUserDefaults" */
  category: string;
  /** Short human label */
  label: string;
  /** What this category covers, in plain English */
  description: string;
  /** Specific Swift / Foundation / UIKit APIs that trigger this category */
  apis: string[];
  /** Plain-English "if you do X, declare this" */
  whenYouNeed: string;
  /** All allowed reasons Apple defined for this category */
  reasons: RequiredReason[];
  /** Most apps need this — sort hint for the form */
  veryCommon?: boolean;
}

export const REQUIRED_REASON_CATEGORIES: RequiredReasonCategory[] = [
  {
    category: 'NSPrivacyAccessedAPICategoryUserDefaults',
    label: 'User Defaults',
    description: 'UserDefaults / @AppStorage — almost every iOS app touches this.',
    apis: ['UserDefaults.standard', '@AppStorage', 'UserDefaults(suiteName:)'],
    whenYouNeed: 'You read or write anything via UserDefaults or @AppStorage anywhere in your app.',
    veryCommon: true,
    reasons: [
      {
        code: 'CA92.1',
        description: 'Access info about the app itself (the everyday case — pick this for almost any app).',
        example: 'Storing user preferences, cached state, last-opened tab, theme choice.',
      },
      {
        code: '1C8F.1',
        description: 'Access defaults belonging to an App Group your app is part of.',
        example: 'Sharing data between the main app and a widget / extension / Watch app.',
      },
      {
        code: 'C56D.1',
        description: 'Access defaults set by managed app configuration (MDM).',
        example: 'Enterprise apps configured by an IT admin via mobile device management.',
      },
    ],
  },
  {
    category: 'NSPrivacyAccessedAPICategoryFileTimestamp',
    label: 'File Timestamp',
    description: 'Reading or writing file creation / modification dates.',
    apis: ['NSFileCreationDate', 'NSFileModificationDate', 'creationDate', 'contentModificationDateKey'],
    whenYouNeed: 'You read or display file timestamps anywhere — even just "Modified Yesterday" labels.',
    veryCommon: true,
    reasons: [
      {
        code: 'DDA9.1',
        description: 'Display file timestamps to the person using the device.',
        example: 'Showing "Modified 2 hours ago" in a file list view.',
      },
      {
        code: 'C617.1',
        description: 'Read or write timestamps inside your app container, App Group container, or CloudKit container.',
        example: 'Your app saves files locally and reads their timestamps later.',
      },
      {
        code: '3B52.1',
        description: 'Read or write timestamps when the user picks a file via the system file picker.',
        example: 'User picks a file via UIDocumentPicker, you read its timestamp.',
      },
      {
        code: '0A2A.1',
        description: 'Access timestamps of files inside your own app bundle (read-only).',
        example: 'Reading the modification date of a bundled resource file.',
      },
    ],
  },
  {
    category: 'NSPrivacyAccessedAPICategorySystemBootTime',
    label: 'System Boot Time',
    description: 'systemUptime, mach_absolute_time(), CACurrentMediaTime — anything that derives from boot time.',
    apis: ['ProcessInfo.systemUptime', 'mach_absolute_time()', 'CACurrentMediaTime()', 'CFAbsoluteTimeGetCurrent'],
    whenYouNeed: 'You measure relative time inside your app (animations, perf instrumentation, timeouts).',
    reasons: [
      {
        code: '35F9.1',
        description: 'Measure time elapsed between events that occur in your app.',
        example: 'Tracking how long an operation took, or animation timing.',
      },
      {
        code: '8FFB.1',
        description: 'Compute absolute timestamps for in-app events (not for sharing across devices).',
        example: 'Logging timestamps for diagnostic data on this device.',
      },
      {
        code: '3D61.1',
        description: 'Use as input to a CryptoKit function.',
        example: 'Generating cryptographic salts or nonces from system uptime.',
      },
    ],
  },
  {
    category: 'NSPrivacyAccessedAPICategoryDiskSpace',
    label: 'Disk Space',
    description: 'volumeAvailableCapacityKey and friends — anything that reports available or total disk space.',
    apis: ['volumeAvailableCapacityKey', 'volumeTotalCapacityKey', 'volumeAvailableCapacityForImportantUsageKey'],
    whenYouNeed: 'You check available or total disk space for any reason.',
    reasons: [
      {
        code: '85F4.1',
        description: 'Display available disk space to the person using the device.',
        example: 'Showing "12 GB free" inside an app settings screen.',
      },
      {
        code: 'E174.1',
        description: 'Check before writing to ensure adequate disk space (must follow a user-initiated action).',
        example: 'Before exporting a large video, verify there is enough room.',
      },
      {
        code: '7D9E.1',
        description: 'Check before downloading content from a server (user-initiated).',
        example: 'Before starting a download, verify there is enough room.',
      },
      {
        code: 'B728.1',
        description: 'Send disk space data to a server when the user explicitly requests support.',
        example: 'User submits a bug report and you include disk-space context.',
      },
    ],
  },
  {
    category: 'NSPrivacyAccessedAPICategoryActiveKeyboards',
    label: 'Active Keyboards',
    description: 'UITextInputMode.activeInputModes — querying which input methods the user has installed.',
    apis: ['UITextInputMode.activeInputModes'],
    whenYouNeed: 'Your app is itself a custom keyboard extension, OR needs to know what keyboards the user has installed.',
    reasons: [
      {
        code: '3EC4.1',
        description: 'Your app is itself a custom keyboard extension.',
        example: 'Your app provides a custom keyboard via the keyboard extension API.',
      },
      {
        code: '54BD.1',
        description: 'Your app needs to display localized UI based on the user\'s installed keyboards.',
        example: 'Showing language hints in the UI based on installed keyboards.',
      },
    ],
  },
];

/**
 * Common ad / analytics tracking domains. Used as suggestion chips so devs
 * can quickly add the ones they recognize without typing.
 */
export const COMMON_TRACKING_DOMAINS = [
  // Ad networks
  { domain: 'facebook.com', label: 'Meta / Facebook Pixel' },
  { domain: 'doubleclick.net', label: 'Google Ads' },
  { domain: 'googleadservices.com', label: 'Google Ad Services' },
  { domain: 'googlesyndication.com', label: 'Google AdSense' },
  // Analytics
  { domain: 'google-analytics.com', label: 'Google Analytics' },
  { domain: 'analytics.google.com', label: 'Google Analytics 4' },
  { domain: 'mixpanel.com', label: 'Mixpanel' },
  { domain: 'amplitude.com', label: 'Amplitude' },
  { domain: 'segment.io', label: 'Segment' },
  { domain: 'app-measurement.com', label: 'Firebase Analytics' },
  // Attribution
  { domain: 'appsflyer.com', label: 'AppsFlyer' },
  { domain: 'adjust.com', label: 'Adjust' },
  { domain: 'branch.io', label: 'Branch' },
  { domain: 'singular.net', label: 'Singular' },
];

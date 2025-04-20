import { getSupabaseBrowserClient, getSupabaseServerClient } from './supabase'

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path Optional path within the bucket
 * @returns URL of the uploaded file
 */
export async function uploadFile(file: File, bucket: string, path?: string): Promise<string> {
  const supabase = getSupabaseBrowserClient()
  
  // Generate a unique filename to prevent collisions
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const filePath = path ? `${path}/${fileName}` : fileName
  
  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Error uploading file:', error)
    throw new Error(`Failed to upload file: ${error.message}`)
  }
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data?.path || filePath)
  
  return publicUrl
}

/**
 * Upload a profile image
 * @param file The image file to upload
 * @returns URL of the uploaded profile image
 */
export async function uploadProfileImage(file: File): Promise<string> {
  return uploadFile(file, 'profile-images')
}

/**
 * Upload a tweet image
 * @param file The image file to upload
 * @returns URL of the uploaded tweet image
 */
export async function uploadTweetImage(file: File): Promise<string> {
  return uploadFile(file, 'tweet-images')
}

/**
 * Server-side function to check if a bucket exists and create it if not
 * This should be run during app initialization
 */
export async function ensureStorageBuckets() {
  const supabase = getSupabaseServerClient()
  
  // Check and create profile-images bucket
  const { data: profileBucket, error: profileError } = await supabase.storage
    .getBucket('profile-images')
  
  if (profileError && profileError.code === 'PGRST116') { // Bucket not found
    await supabase.storage.createBucket('profile-images', {
      public: true,
      fileSizeLimit: 1024 * 1024 * 2 // 2MB limit for profile images
    })
  }
  
  // Check and create tweet-images bucket
  const { data: tweetBucket, error: tweetError } = await supabase.storage
    .getBucket('tweet-images')
  
  if (tweetError && tweetError.code === 'PGRST116') { // Bucket not found
    await supabase.storage.createBucket('tweet-images', {
      public: true,
      fileSizeLimit: 1024 * 1024 * 5 // 5MB limit for tweet images
    })
  }
} 
"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";

interface Section {
  key: string;
  title: string;
  description: string;
  image_url?: string; // Optional image for sections like hero
  link_url?: string; // Optional link for clickable images
}

interface Dusun {
  key: string;
  name: string;
  deskripsi: string;
  link_gambar: string;
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  uploaded_at: string;
}

interface ContentData {
  _id: string;
  sections: Section[];
  dusun: Dusun[];
  gallery: GalleryItem[];
  infografis: {
    penduduk: number;
    total: number;
    luas_wilayah: number;
    jarak_dari_rantepao: number;
  };
}

export default function AdminPage() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const session = localStorage.getItem("admin_session");
      if (session === "authenticated") {
        setIsAuthenticated(true);
      } else {
        router.push("/login");
        return;
      }
      setChecking(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return; // Don't fetch data if not authenticated
    
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => {
        console.log("Data received:", data); // Debug log
        console.log("Gallery data:", data.gallery); // Debug gallery specifically
        if (data && data.sections) {
          // Ensure hero section exists
          if (!data.sections.find((section: Section) => section.key === 'hero')) {
            data.sections.unshift({
              key: 'hero',
              title: 'Selamat Datang Website Resmi Sangpiak Salu',
              description: 'Sumber informasi tentang pemerintahan di Sangpiak Salu',
              image_url: ''
            });
          }
          
          // Ensure dusun array exists
          if (!data.dusun) {
            data.dusun = [
              { key: "dusun1", name: "Dusun 1", deskripsi: "", link_gambar: "" },
              { key: "dusun2", name: "Dusun 2", deskripsi: "", link_gambar: "" },
              { key: "dusun3", name: "Dusun 3", deskripsi: "", link_gambar: "" }
            ];
          }
          // Ensure gallery array exists
          if (!data.gallery) {
            data.gallery = [];
          }
          console.log("Final data set to state:", data); // Debug final data
          setData(data);
        } else {
          console.error("Data does not have sections property:", data);
          // Initialize with empty sections if data is missing
          setData({
            _id: data?._id || "",
            sections: [
              {
                key: 'hero',
                title: 'Selamat Datang Website Resmi Sangpiak Salu',
                description: 'Sumber informasi tentang pemerintahan di Sangpiak Salu',
                image_url: ''
              }
            ],
            dusun: [
              { key: "dusun1", name: "Dusun 1", deskripsi: "", link_gambar: "" },
              { key: "dusun2", name: "Dusun 2", deskripsi: "", link_gambar: "" },
              { key: "dusun3", name: "Dusun 3", deskripsi: "", link_gambar: "" }
            ],
            gallery: [],
            infografis: data?.infografis || {
              penduduk: 0,
              total: 0,
              luas_wilayah: 0,
              jarak_dari_rantepao: 0,
            },
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  }, [isAuthenticated]);

  async function handleSave() {
    if (!data) return;
    
    setSaving(true);
    try {
      const response = await fetch("/api/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.success) {
          alert("✅ " + result.message);
        } else {
          alert("⚠️ " + result.message);
        }
      } else {
        alert("❌ Error: " + (result.error || result.message));
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("❌ Gagal menyimpan data. Periksa koneksi internet dan coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  function handleSectionChange(index: number, field: keyof Section, value: string) {
    if (!data) return;
    const newData = { ...data };
    (newData.sections[index][field] as any) = value;
    setData(newData);
  }

  async function handleSectionImageUpload(sectionIndex: number, file: File) {
    if (!file) return;

    // Validate file size (3MB limit)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      alert('❌ File size must be less than 3MB. Current size: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file.');
      return;
    }

    const sectionKey = data?.sections[sectionIndex]?.key || `section${sectionIndex + 1}`;
    const oldImageUrl = data?.sections[sectionIndex]?.image_url;
    
    setUploading(prev => ({ ...prev, [sectionKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // If there's an old image, include it for deletion
      if (oldImageUrl) {
        formData.append('oldImageUrl', oldImageUrl);
      }

      const response = await fetch('/api/uploud', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.secure_url) {
        handleSectionChange(sectionIndex, 'image_url', result.secure_url);
        alert('✅ Image uploaded successfully!');
      } else {
        alert('❌ Failed to upload image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('❌ Failed to upload image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [sectionKey]: false }));
    }
  }

  async function handleSectionImageRemove(sectionIndex: number) {
    if (!data?.sections[sectionIndex]?.image_url) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this image?');
    if (!confirmDelete) return;

    const sectionKey = data?.sections[sectionIndex]?.key || `section${sectionIndex + 1}`;
    const imageUrl = data.sections[sectionIndex].image_url;
    
    setUploading(prev => ({ ...prev, [sectionKey]: true }));

    try {
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        handleSectionChange(sectionIndex, 'image_url', '');
        alert('✅ Image removed successfully!');
      } else {
        alert('❌ Failed to remove image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('❌ Failed to remove image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [sectionKey]: false }));
    }
  }

  function handleInfografisChange(field: keyof ContentData['infografis'], value: number) {
    if (!data) return;
    const newData = { ...data };
    newData.infografis[field] = value;
    setData(newData);
  }

  function handleDusunChange(index: number, field: keyof Dusun, value: string) {
    if (!data) return;
    const newData = { ...data };
    (newData.dusun[index][field] as any) = value;
    setData(newData);
  }

  function handleGalleryItemChange(index: number, field: keyof GalleryItem, value: string) {
    if (!data) return;
    const newData = { ...data };
    (newData.gallery[index][field] as any) = value;
    setData(newData);
  }

  function addGalleryItem() {
    if (!data) return;
    const newItem: GalleryItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      image_url: "",
      uploaded_at: new Date().toISOString()
    };
    const newData = { ...data };
    newData.gallery.push(newItem);
    setData(newData);
  }

  async function removeGalleryItem(index: number) {
    if (!data) return;
    const confirmDelete = confirm('Are you sure you want to remove this gallery item?');
    if (!confirmDelete) return;

    const newData = { ...data };
    // If there's an image, we should also delete it from Cloudinary
    const galleryItem = newData.gallery[index];
    if (galleryItem.image_url) {
      // Delete image from Cloudinary first, then remove from array
      try {
        const response = await fetch('/api/uploud', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: galleryItem.image_url }),
        });
        if (!response.ok) {
          console.error('Failed to delete image from Cloudinary');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    newData.gallery.splice(index, 1);
    setData(newData);
  }

  async function handleImageUpload(dusunIndex: number, file: File) {
    if (!file) return;

    // Validate file size (3MB limit)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      alert('❌ File size must be less than 3MB. Current size: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file.');
      return;
    }

    const dusunKey = data?.dusun[dusunIndex]?.key || `dusun${dusunIndex + 1}`;
    const oldImageUrl = data?.dusun[dusunIndex]?.link_gambar;
    
    setUploading(prev => ({ ...prev, [dusunKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // If there's an old image, include it for deletion
      if (oldImageUrl) {
        formData.append('oldImageUrl', oldImageUrl);
      }

      const response = await fetch('/api/uploud', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.secure_url) {
        handleDusunChange(dusunIndex, 'link_gambar', result.secure_url);
        alert('✅ Image uploaded successfully!');
      } else {
        alert('❌ Failed to upload image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('❌ Failed to upload image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [dusunKey]: false }));
    }
  }

  async function handleImageRemove(dusunIndex: number) {
    if (!data?.dusun[dusunIndex]?.link_gambar) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this image?');
    if (!confirmDelete) return;

    const dusunKey = data?.dusun[dusunIndex]?.key || `dusun${dusunIndex + 1}`;
    const imageUrl = data.dusun[dusunIndex].link_gambar;
    
    setUploading(prev => ({ ...prev, [dusunKey]: true }));

    try {
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        handleDusunChange(dusunIndex, 'link_gambar', '');
        alert('✅ Image removed successfully!');
      } else {
        alert('❌ Failed to remove image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('❌ Failed to remove image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [dusunKey]: false }));
    }
  }

  async function handleGalleryImageUpload(galleryIndex: number, file: File) {
    if (!file) return;

    // Validate file size (3MB limit)
    const maxSize = 3 * 1024 * 1024; // 3MB in bytes
    if (file.size > maxSize) {
      alert('❌ File size must be less than 3MB. Current size: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('❌ Please select a valid image file.');
      return;
    }

    const galleryKey = `gallery_${galleryIndex}`;
    const oldImageUrl = data?.gallery[galleryIndex]?.image_url;
    
    setUploading(prev => ({ ...prev, [galleryKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // If there's an old image, include it for deletion
      if (oldImageUrl) {
        formData.append('oldImageUrl', oldImageUrl);
      }

      const response = await fetch('/api/uploud', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.secure_url) {
        handleGalleryItemChange(galleryIndex, 'image_url', result.secure_url);
        // Update uploaded_at timestamp
        handleGalleryItemChange(galleryIndex, 'uploaded_at', new Date().toISOString());
        alert('✅ Image uploaded successfully!');
      } else {
        alert('❌ Failed to upload image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('❌ Failed to upload image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [galleryKey]: false }));
    }
  }

  async function handleGalleryImageRemove(galleryIndex: number) {
    if (!data?.gallery[galleryIndex]?.image_url) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this image?');
    if (!confirmDelete) return;

    const galleryKey = `gallery_${galleryIndex}`;
    const imageUrl = data.gallery[galleryIndex].image_url;
    
    setUploading(prev => ({ ...prev, [galleryKey]: true }));

    try {
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        handleGalleryItemChange(galleryIndex, 'image_url', '');
        alert('✅ Image removed successfully!');
      } else {
        alert('❌ Failed to remove image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('❌ Failed to remove image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [galleryKey]: false }));
    }
  }

  async function handleLogout() {
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) return;

    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem("admin_session");
      router.push("/login");
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      localStorage.removeItem("admin_session");
      router.push("/login");
    }
  }

  // Show loading while checking authentication
  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-700 mt-4 text-center">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-700 mt-4 text-center">Loading data...</p>
      </div>
    </div>
  );
  
  if (!data) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <p className="text-gray-700">Data tidak ditemukan</p>
      </div>
    </div>
  );
  
  if (!data.sections || !Array.isArray(data.sections)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-gray-700">Data sections tidak ditemukan atau format tidak valid</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                Administration Panel
              </h1>
              <p className="text-sm text-gray-600 mt-1 font-medium">Desa Sangpiak Salu • Content Management System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        
        {/* Sections */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Content Sections</h2>
            <p className="text-gray-600">Manage website content sections and their descriptions</p>
          </div>
          
          {data.sections.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">No sections found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {data.sections.map((section, i) => (
                <div key={section.key} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <span className="bg-gray-100 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {section.key === 'hero' ? '🏠' : i + 1}
                      </span>
                      {section.key === 'hero' ? 'Hero Section (Homepage Banner)' : `Section ${i + 1}`}
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Title
                          </label>
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleSectionChange(i, "title", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                            placeholder="Enter section title"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={section.description}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                              handleSectionChange(i, "description", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none text-gray-700"
                            placeholder="Enter section description"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link URL {section.key === 'hero' ? '(Optional)' : '(Optional - makes image clickable)'}
                          </label>
                          <input
                            type="url"
                            value={section.link_url || ''}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleSectionChange(i, "link_url", e.target.value)
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                            placeholder="https://example.com (optional)"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Section Image {section.key === 'hero' ? '(Hero Banner)' : '(Optional)'}
                        </label>
                        
                        {section.image_url ? (
                          <div className="space-y-3">
                            <div className="relative group">
                              <img
                                src={section.image_url}
                                alt={section.title}
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                onLoad={(e) => {
                                  console.log('✅ Section image loaded successfully:', section.image_url);
                                }}
                                onError={(e) => {
                                  console.error('❌ Section image failed to load:', section.image_url);
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                  <label className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                                    Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleSectionImageUpload(i, file);
                                      }}
                                      disabled={uploading[section.key]}
                                    />
                                  </label>
                                  <button
                                    onClick={() => handleSectionImageRemove(i)}
                                    disabled={uploading[section.key]}
                                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Hover over image to replace or remove</p>
                          </div>
                        ) : (
                          <div className="border border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                            <div className="space-y-2">
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="text-sm text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                  <span>Upload an image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleSectionImageUpload(i, file);
                                    }}
                                    disabled={uploading[section.key]}
                                  />
                                </label>
                                <span className="text-gray-500"> or drag and drop</span>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 3MB</p>
                            </div>
                          </div>
                        )}
                        
                        {uploading[section.key] && (
                          <div className="mt-3 flex items-center justify-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-blue-600 text-sm">Processing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full px-6 py-4 rounded-md text-white font-medium text-base transition-colors ${
                saving 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving changes...
                </div>
              ) : (
                "Save All Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

interface DusunGalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  uploaded_at: string;
}

interface Dusun {
  key: string;
  name: string;
  deskripsi: string;
  link_gambar: string;
  link_kadus?: string; // New field for kadus photo
  nama_kadus?: string; // New field for kadus name
  gallery?: DusunGalleryItem[]; // New field for dusun gallery
}

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  uploaded_at: string;
}

interface PegawaiItem {
  id: string;
  nama: string;
  jabatan: string;
  foto_url: string;
  deskripsi?: string;
  created_at: string;
}

interface KknGalleryItem {
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
  pegawai: PegawaiItem[];
  galeri_kkn: KknGalleryItem[];
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
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});
  const [uploadingGallery, setUploadingGallery] = useState<{ [key: string]: boolean }>({});
  const [newGalleryItem, setNewGalleryItem] = useState<{ [dusunKey: string]: { title: string; description: string } }>({});
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check localStorage
        const localSession = localStorage.getItem("admin_session");
        
        // Then verify with server
        const response = await fetch("/api/auth/verify", {
          method: "GET",
          credentials: 'include' // Include cookies
        });

        const result = await response.json();

        if (response.ok && result.authenticated && localSession === "authenticated") {
          setIsAuthenticated(true);
        } else {
          // Clear invalid localStorage and redirect
          localStorage.removeItem("admin_session");
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("admin_session");
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
        console.log("Sections data:", data.sections); // Debug sections specifically
        console.log("Gallery data:", data.gallery); // Debug gallery specifically
        
        // Log each section's image_url
        if (data.sections) {
          data.sections.forEach((section: Section, index: number) => {
            console.log(`Section ${index} (${section.key}):`, {
              title: section.title,
              image_url: section.image_url,
              hasImage: !!section.image_url
            });
          });
        }
        
        if (data && data.sections) {
          // Ensure all required sections exist
          const requiredSections = [
            { key: 'hero', title: 'Selamat Datang di Website Sangpiak Salu', description: 'Sumber informasi tentang pemerintahan di Sangpiak Salu' },
            { key: 'section1', title: 'Jelajahi Desa', description: 'Melalui website ini Anda dapat menjelajahi segala hal yang terkait dengan desa' },
            { key: 'kata_sambutan', title: 'Kata Sambutan Kepala Desa', description: 'Sambutan dari kepala desa untuk warga dan pengunjung' },
            { key: 'potensi_desa', title: 'Potensi Desa', description: 'Berbagai potensi yang dimiliki oleh desa kami' }
          ];

          // Add missing sections
          requiredSections.forEach(reqSection => {
            if (!data.sections.find((section: Section) => section.key === reqSection.key)) {
              data.sections.push({
                key: reqSection.key,
                title: reqSection.title,
                description: reqSection.description,
                image_url: ''
              });
            }
          });
          
          // Ensure dusun array exists with all 4 dusuns
          if (!data.dusun) {
            data.dusun = [
              { key: "dusun1", name: "Dusun 1", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] },
              { key: "dusun2", name: "Dusun 2", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] },
              { key: "dusun3", name: "Dusun 3", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] },
              { key: "dusun4", name: "Dusun 4", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] }
            ];
          } else {
            // Ensure all 4 dusuns exist
            const requiredDusuns = [
              { key: "dusun1", name: "Dusun 1" },
              { key: "dusun2", name: "Dusun 2" },
              { key: "dusun3", name: "Dusun 3" },
              { key: "dusun4", name: "Dusun 4" }
            ];
            
            requiredDusuns.forEach(reqDusun => {
              if (!data.dusun.find((dusun: Dusun) => dusun.key === reqDusun.key)) {
                data.dusun.push({
                  key: reqDusun.key,
                  name: reqDusun.name,
                  deskripsi: "",
                  link_gambar: "",
                  nama_kadus: "",
                  link_kadus: "",
                  gallery: []
                });
              } else {
                // Ensure existing dusuns have gallery property
                const existingDusun = data.dusun.find((dusun: Dusun) => dusun.key === reqDusun.key);
                if (existingDusun && !existingDusun.gallery) {
                  existingDusun.gallery = [];
                }
                if (existingDusun && !existingDusun.nama_kadus) {
                  existingDusun.nama_kadus = "";
                }
                if (existingDusun && !existingDusun.link_kadus) {
                  existingDusun.link_kadus = "";
                }
              }
            });
          }
          // Ensure gallery array exists
          if (!data.gallery) {
            data.gallery = [];
          }
          // Ensure pegawai array exists
          if (!data.pegawai) {
            data.pegawai = [];
          }
          // Ensure galeri_kkn array exists
          if (!data.galeri_kkn) {
            data.galeri_kkn = [];
          }
          // Ensure infografis exists
          if (!data.infografis) {
            data.infografis = {
              penduduk: 0,
              total: 0,
              luas_wilayah: 0,
              jarak_dari_rantepao: 0,
            };
          }
          console.log("Final data set to state:", data); // Debug final data
          setData(data);
        } else {
          console.error("Data does not have sections property:", data);
          // Initialize with default sections if data is missing
          setData({
            _id: data?._id || "homepage-content",
            sections: [
              { key: 'hero', title: 'Selamat Datang di Website Sangpiak Salu', description: 'Sumber informasi tentang pemerintahan di Sangpiak Salu', image_url: '' },
              { key: 'section1', title: 'Jelajahi Desa', description: 'Melalui website ini Anda dapat menjelajahi segala hal yang terkait dengan desa', image_url: '' },
              { key: 'kata_sambutan', title: 'Kata Sambutan Kepala Desa', description: 'Sambutan dari kepala desa untuk warga dan pengunjung', image_url: '' },
              { key: 'potensi_desa', title: 'Potensi Desa', description: 'Berbagai potensi yang dimiliki oleh desa kami', image_url: '' }
            ],
            dusun: [
              { key: "dusun1", name: "Dusun 1", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] },
              { key: "dusun2", name: "Dusun 2", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] },
              { key: "dusun3", name: "Dusun 3", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] },
              { key: "dusun4", name: "Dusun 4", deskripsi: "", link_gambar: "", nama_kadus: "", link_kadus: "", gallery: [] }
            ],
            gallery: [],
            pegawai: [],
            galeri_kkn: [],
            infografis: {
              penduduk: 1099,
              total: 1000,
              luas_wilayah: 12155,
              jarak_dari_rantepao: 1242,
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
    
    // Reset image error state when image_url changes
    if (field === 'image_url') {
      setImageErrors(prev => ({...prev, [`section_${index}`]: false}));
    }
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
    
    // Reset image error state when image fields change
    if (field === 'link_gambar' || field === 'link_kadus') {
      const errorKey = field === 'link_gambar' ? `dusun_${index}` : `dusun_kadus_${index}`;
      setImageErrors(prev => ({...prev, [errorKey]: false}));
    }
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

  function handlePegawaiItemChange(index: number, field: keyof PegawaiItem, value: string) {
    if (!data) return;
    const newData = { ...data };
    (newData.pegawai[index][field] as any) = value;
    setData(newData);
  }

  function addPegawaiItem() {
    if (!data) return;
    const newItem: PegawaiItem = {
      id: Date.now().toString(),
      nama: "",
      jabatan: "",
      foto_url: "",
      deskripsi: "",
      created_at: new Date().toISOString()
    };
    const newData = { ...data };
    newData.pegawai.push(newItem);
    setData(newData);
  }

  async function removePegawaiItem(index: number) {
    if (!data) return;
    const confirmDelete = confirm('Are you sure you want to remove this employee?');
    if (!confirmDelete) return;

    const newData = { ...data };
    // If there's a photo, we should also delete it from Cloudinary
    const pegawaiItem = newData.pegawai[index];
    if (pegawaiItem.foto_url) {
      // Delete photo from Cloudinary first, then remove from array
      try {
        const response = await fetch('/api/uploud', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: pegawaiItem.foto_url }),
        });
        if (!response.ok) {
          console.error('Failed to delete photo from Cloudinary');
        }
      } catch (error) {
        console.error('Error deleting photo:', error);
      }
    }
    newData.pegawai.splice(index, 1);
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

  // New functions for Kadus image handling
  async function handleKadusImageUpload(dusunIndex: number, file: File) {
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

    const kadusKey = `kadus_${dusunIndex}`;
    const oldImageUrl = data?.dusun[dusunIndex]?.link_kadus;
    
    setUploading(prev => ({ ...prev, [kadusKey]: true }));

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
        handleDusunChange(dusunIndex, 'link_kadus', result.secure_url);
        alert('✅ Kadus image uploaded successfully!');
      } else {
        alert('❌ Failed to upload kadus image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading kadus image:', error);
      alert('❌ Failed to upload kadus image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [kadusKey]: false }));
    }
  }

  async function handleKadusImageRemove(dusunIndex: number) {
    if (!data?.dusun[dusunIndex]?.link_kadus) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this kadus image?');
    if (!confirmDelete) return;

    const kadusKey = `kadus_${dusunIndex}`;
    const imageUrl = data.dusun[dusunIndex].link_kadus!;
    
    setUploading(prev => ({ ...prev, [kadusKey]: true }));

    try {
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        handleDusunChange(dusunIndex, 'link_kadus', '');
        alert('✅ Kadus image removed successfully!');
      } else {
        alert('❌ Failed to remove kadus image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing kadus image:', error);
      alert('❌ Failed to remove kadus image. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [kadusKey]: false }));
    }
  }

  // Functions for managing dusun gallery
  async function handleDusunGalleryUpload(dusunIndex: number, file: File) {
    if (!file || !data) return;

    const dusun = data.dusun[dusunIndex];
    const galleryData = newGalleryItem[dusun.key];
    
    if (!galleryData || !galleryData.title.trim() || !galleryData.description.trim()) {
      alert('❌ Please fill in title and description before uploading image');
      return;
    }

    // Validate file size (3MB limit)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('❌ File size must be less than 3MB. Current size: ' + (file.size / 1024 / 1024).toFixed(2) + 'MB');
      return;
    }

    const galleryKey = `gallery_${dusun.key}`;
    setUploadingGallery(prev => ({ ...prev, [galleryKey]: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploud', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.secure_url) {
        const newGalleryItem: DusunGalleryItem = {
          id: Date.now().toString(),
          title: galleryData.title.trim(),
          description: galleryData.description.trim(),
          image_url: result.secure_url,
          uploaded_at: new Date().toISOString()
        };

        const newData = { ...data };
        if (!newData.dusun[dusunIndex].gallery) {
          newData.dusun[dusunIndex].gallery = [];
        }
        newData.dusun[dusunIndex].gallery!.push(newGalleryItem);
        
        setData(newData);
        
        // Reset form
        setNewGalleryItem(prev => ({
          ...prev,
          [dusun.key]: { title: '', description: '' }
        }));
        
        alert('✅ Gallery image uploaded successfully!');
      } else {
        alert('❌ Failed to upload gallery image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      alert('❌ Failed to upload gallery image. Please check your internet connection.');
    } finally {
      setUploadingGallery(prev => ({ ...prev, [galleryKey]: false }));
    }
  }

  async function handleDusunGalleryRemove(dusunIndex: number, galleryItemId: string) {
    if (!data) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this gallery image?');
    if (!confirmDelete) return;

    const dusun = data.dusun[dusunIndex];
    const galleryItem = dusun.gallery?.find(item => item.id === galleryItemId);
    
    if (!galleryItem) return;

    const galleryKey = `gallery_${dusun.key}_${galleryItemId}`;
    setUploadingGallery(prev => ({ ...prev, [galleryKey]: true }));

    try {
      // Delete from Cloudinary first
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: galleryItem.image_url }),
      });

      if (response.ok) {
        const newData = { ...data };
        newData.dusun[dusunIndex].gallery = newData.dusun[dusunIndex].gallery?.filter(
          item => item.id !== galleryItemId
        ) || [];
        
        setData(newData);
        alert('✅ Gallery image removed successfully!');
      } else {
        const result = await response.json();
        alert('❌ Failed to remove gallery image: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing gallery image:', error);
      alert('❌ Failed to remove gallery image. Please check your internet connection.');
    } finally {
      setUploadingGallery(prev => ({ ...prev, [galleryKey]: false }));
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

  async function handlePegawaiFotoUpload(pegawaiIndex: number, file: File) {
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

    const pegawaiKey = `pegawai_${pegawaiIndex}`;
    const oldImageUrl = data?.pegawai[pegawaiIndex]?.foto_url;
    
    setUploading(prev => ({ ...prev, [pegawaiKey]: true }));

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
        handlePegawaiItemChange(pegawaiIndex, 'foto_url', result.secure_url);
        // Update created_at timestamp
        handlePegawaiItemChange(pegawaiIndex, 'created_at', new Date().toISOString());
        alert('✅ Photo uploaded successfully!');
      } else {
        alert('❌ Failed to upload photo: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('❌ Failed to upload photo. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [pegawaiKey]: false }));
    }
  }

  async function handlePegawaiFotoRemove(pegawaiIndex: number) {
    if (!data?.pegawai[pegawaiIndex]?.foto_url) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this photo?');
    if (!confirmDelete) return;

    const pegawaiKey = `pegawai_${pegawaiIndex}`;
    const imageUrl = data.pegawai[pegawaiIndex].foto_url;
    
    setUploading(prev => ({ ...prev, [pegawaiKey]: true }));

    try {
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        handlePegawaiItemChange(pegawaiIndex, 'foto_url', '');
        alert('✅ Photo removed successfully!');
      } else {
        alert('❌ Failed to remove photo: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing photo:', error);
      alert('❌ Failed to remove photo. Please check your internet connection.');
    } finally {
      setUploading(prev => ({ ...prev, [pegawaiKey]: false }));
    }
  }

  // KKN Gallery Functions
  function handleKknGalleryItemChange(index: number, field: keyof KknGalleryItem, value: string) {
    if (!data) return;
    const newData = { ...data };
    (newData.galeri_kkn[index][field] as any) = value;
    setData(newData);
  }

  function addKknGalleryItem() {
    if (!data) return;
    const newItem: KknGalleryItem = {
      id: Date.now().toString(),
      title: "",
      description: "",
      image_url: "",
      uploaded_at: new Date().toISOString()
    };
    const newData = { ...data };
    newData.galeri_kkn.push(newItem);
    setData(newData);
  }

  async function removeKknGalleryItem(index: number) {
    if (!data) return;
    const confirmDelete = confirm('Are you sure you want to remove this KKN gallery item?');
    if (!confirmDelete) return;

    const newData = { ...data };
    // If there's an image, we should also delete it from Cloudinary
    const kknGalleryItem = newData.galeri_kkn[index];
    if (kknGalleryItem.image_url) {
      // Delete image from Cloudinary first, then remove from array
      try {
        const response = await fetch('/api/uploud', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: kknGalleryItem.image_url }),
        });
        if (!response.ok) {
          console.error('Failed to delete image from Cloudinary');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    newData.galeri_kkn.splice(index, 1);
    setData(newData);
  }

  async function handleKknGalleryImageUpload(galleryIndex: number, file: File) {
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

    const galleryKey = `kkn_gallery_${galleryIndex}`;
    const oldImageUrl = data?.galeri_kkn[galleryIndex]?.image_url;
    
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
        handleKknGalleryItemChange(galleryIndex, 'image_url', result.secure_url);
        // Update uploaded_at timestamp
        handleKknGalleryItemChange(galleryIndex, 'uploaded_at', new Date().toISOString());
        alert('✅ KKN gallery image uploaded successfully!');
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

  async function handleKknGalleryImageRemove(galleryIndex: number) {
    if (!data?.galeri_kkn[galleryIndex]?.image_url) return;
    
    const confirmDelete = confirm('Are you sure you want to remove this KKN gallery image?');
    if (!confirmDelete) return;

    const galleryKey = `kkn_gallery_${galleryIndex}`;
    const imageUrl = data.galeri_kkn[galleryIndex].image_url;
    
    setUploading(prev => ({ ...prev, [galleryKey]: true }));

    try {
      const response = await fetch('/api/uploud', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const result = await response.json();

      if (response.ok) {
        handleKknGalleryItemChange(galleryIndex, 'image_url', '');
        alert('✅ KKN gallery image removed successfully!');
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
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include' // Include cookies for proper logout
      });
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
                        {section.key === 'hero' ? '🏠' : 
                         section.key === 'section1' ? '🌟' :
                         section.key === 'kata_sambutan' ? '👨‍💼' :
                         section.key === 'potensi_desa' ? '🌾' : i + 1}
                      </span>
                      {section.key === 'hero' ? 'Hero Section (Homepage Banner)' : 
                       section.key === 'section1' ? 'Section 1 (Jelajahi Desa)' :
                       section.key === 'kata_sambutan' ? 'Kata Sambutan Kepala Desa' :
                       section.key === 'potensi_desa' ? 'Potensi Desa' :
                       `Section ${i + 1}`}
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
                        
                        {section.image_url && section.image_url.trim() !== '' ? (
                          <div className="space-y-3">
                            <div className="relative group">
                              {!imageErrors[`section_${i}`] ? (
                                <img
                                  src={section.image_url}
                                  alt={section.title}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                  onLoad={() => {
                                    console.log('✅ Section image loaded successfully:', section.image_url);
                                    setImageErrors(prev => ({...prev, [`section_${i}`]: false}));
                                  }}
                                  onError={() => {
                                    console.error('❌ Section image failed to load:', section.image_url);
                                    setImageErrors(prev => ({...prev, [`section_${i}`]: true}));
                                  }}
                                />
                              ) : (
                                <div className="w-full h-48 bg-red-50 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center text-red-600">
                                  <div className="text-center p-4">
                                    <svg className="mx-auto h-12 w-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L2.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-sm font-medium">Failed to load image</p>
                                    <p className="text-xs text-red-400 mt-1 break-all max-w-xs">{section.image_url}</p>
                                    <button
                                      onClick={() => setImageErrors(prev => ({...prev, [`section_${i}`]: false}))}
                                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                </div>
                              )}
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
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>Hover over image to replace or remove</p>
                              <p className="font-mono text-xs bg-gray-100 p-1 rounded break-all">URL: {section.image_url}</p>
                            </div>
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
                              {/* Debug info */}
                              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                                <p className="font-mono text-gray-600">Debug: image_url = "{section.image_url || 'empty/undefined'}"</p>
                                <p className="font-mono text-gray-600">Type: {typeof section.image_url}</p>
                                <p className="font-mono text-gray-600">Length: {section.image_url?.length || 0}</p>
                              </div>
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

        {/* Infografis Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data Infografis</h2>
            <p className="text-gray-600">Manage statistical information about the village</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="bg-gray-100 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  📊
                </span>
                Village Statistics
              </h3>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Penduduk
                  </label>
                  <input
                    type="number"
                    value={data.infografis.penduduk}
                    onChange={(e) => handleInfografisChange('penduduk', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <input
                    type="number"
                    value={data.infografis.total}
                    onChange={(e) => handleInfografisChange('total', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Luas Wilayah (m²)
                  </label>
                  <input
                    type="number"
                    value={data.infografis.luas_wilayah}
                    onChange={(e) => handleInfografisChange('luas_wilayah', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jarak dari Rantepao (km)
                  </label>
                  <input
                    type="number"
                    value={data.infografis.jarak_dari_rantepao}
                    onChange={(e) => handleInfografisChange('jarak_dari_rantepao', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dusun Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data Dusun</h2>
            <p className="text-gray-600">Manage information about village hamlets</p>
          </div>
          
          <div className="space-y-6">
            {data.dusun.map((dusun, i) => (
              <div key={dusun.key} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <span className="bg-gray-100 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      🏘️
                    </span>
                    {dusun.name}
                  </h3>
                </div>
                
                <div className="p-6">
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Column 1: Basic Info */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Dusun
                        </label>
                        <input
                          type="text"
                          value={dusun.name}
                          onChange={(e) => handleDusunChange(i, 'name', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-700"
                          placeholder="Enter dusun name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deskripsi
                        </label>
                        <textarea
                          value={dusun.deskripsi}
                          onChange={(e) => handleDusunChange(i, 'deskripsi', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-32 resize-none text-gray-700"
                          placeholder="Enter dusun description"
                        />
                      </div>
                    </div>

                    {/* Column 2: Dusun Image */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Gambar Dusun
                      </label>
                      
                      {dusun.link_gambar && dusun.link_gambar.trim() !== '' ? (
                        <div className="space-y-3">
                          <div className="relative group">
                            {!imageErrors[`dusun_${i}`] ? (
                              <img
                                src={dusun.link_gambar}
                                alt={dusun.name}
                                className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                onLoad={() => {
                                  console.log('✅ Dusun image loaded:', dusun.name, dusun.link_gambar);
                                  setImageErrors(prev => ({...prev, [`dusun_${i}`]: false}));
                                }}
                                onError={() => {
                                  console.log('❌ Dusun image failed to load:', dusun.name, dusun.link_gambar);
                                  setImageErrors(prev => ({...prev, [`dusun_${i}`]: true}));
                                }}
                              />
                            ) : (
                              <div className="w-full h-48 bg-red-50 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center text-red-600">
                                <div className="text-center p-4">
                                  <svg className="mx-auto h-12 w-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L2.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  <p className="text-sm font-medium">Failed to load image</p>
                                  <button
                                    onClick={() => setImageErrors(prev => ({...prev, [`dusun_${i}`]: false}))}
                                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded"
                                  >
                                    Try Again
                                  </button>
                                </div>
                              </div>
                            )}
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
                                      if (file) handleImageUpload(i, file);
                                    }}
                                    disabled={uploading[dusun.key]}
                                  />
                                </label>
                                <button
                                  onClick={() => handleImageRemove(i)}
                                  disabled={uploading[dusun.key]}
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
                                    if (file) handleImageUpload(i, file);
                                  }}
                                  disabled={uploading[dusun.key]}
                                />
                              </label>
                              <span className="text-gray-500"> or drag and drop</span>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 3MB</p>
                          </div>
                        </div>
                      )}
                      
                      {uploading[dusun.key] && (
                        <div className="mt-3 flex items-center justify-center py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-blue-600 text-sm">Processing...</span>
                        </div>
                      )}
                    </div>

                    {/* Column 3: Kadus Info & Image */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Kepala Dusun
                        </label>
                        <input
                          type="text"
                          value={dusun.nama_kadus || ''}
                          onChange={(e) => handleDusunChange(i, 'nama_kadus', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-700"
                          placeholder="Enter kadus name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Foto Kepala Dusun
                        </label>
                        
                        {dusun.link_kadus && dusun.link_kadus.trim() !== '' ? (
                          <div className="space-y-3">
                            <div className="relative group">
                              {!imageErrors[`dusun_kadus_${i}`] ? (
                                <img
                                  src={dusun.link_kadus}
                                  alt={`Kepala Dusun ${dusun.name}`}
                                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                                  onLoad={() => {
                                    console.log('✅ Kadus image loaded:', dusun.name, dusun.link_kadus);
                                    setImageErrors(prev => ({...prev, [`dusun_kadus_${i}`]: false}));
                                  }}
                                  onError={() => {
                                    console.log('❌ Kadus image failed to load:', dusun.name, dusun.link_kadus);
                                    setImageErrors(prev => ({...prev, [`dusun_kadus_${i}`]: true}));
                                  }}
                                />
                              ) : (
                                <div className="w-full h-48 bg-red-50 rounded-lg border-2 border-dashed border-red-300 flex items-center justify-center text-red-600">
                                  <div className="text-center p-4">
                                    <svg className="mx-auto h-12 w-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.854-.833-2.624 0L2.196 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    <p className="text-sm font-medium">Failed to load image</p>
                                    <button
                                      onClick={() => setImageErrors(prev => ({...prev, [`dusun_kadus_${i}`]: false}))}
                                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded"
                                    >
                                      Try Again
                                    </button>
                                  </div>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                                  <label className="px-3 py-2 bg-green-600 text-white text-sm rounded-md cursor-pointer hover:bg-green-700 transition-colors">
                                    Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleKadusImageUpload(i, file);
                                      }}
                                      disabled={uploading[`kadus_${i}`]}
                                    />
                                  </label>
                                  <button
                                    onClick={() => handleKadusImageRemove(i)}
                                    disabled={uploading[`kadus_${i}`]}
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
                                <label className="relative cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500">
                                  <span>Upload kadus photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleKadusImageUpload(i, file);
                                    }}
                                    disabled={uploading[`kadus_${i}`]}
                                  />
                                </label>
                                <span className="text-gray-500"> or drag and drop</span>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 3MB</p>
                            </div>
                          </div>
                        )}
                        
                        {uploading[`kadus_${i}`] && (
                          <div className="mt-3 flex items-center justify-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            <span className="ml-2 text-green-600 text-sm">Processing...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dusun Gallery Section */}
                  <div className="mt-8 border-t border-gray-200 pt-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">Gallery {dusun.name}</h4>
                        <p className="text-sm text-gray-600">Manage photo gallery for this dusun</p>
                      </div>
                    </div>

                    {/* Add New Gallery Item Form */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h5 className="text-md font-medium text-gray-900 mb-4">Add New Gallery Image</h5>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Title
                          </label>
                          <input
                            type="text"
                            value={newGalleryItem[dusun.key]?.title || ''}
                            onChange={(e) => setNewGalleryItem(prev => ({
                              ...prev,
                              [dusun.key]: {
                                ...prev[dusun.key],
                                title: e.target.value
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-700"
                            placeholder="Enter image title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Description
                          </label>
                          <input
                            type="text"
                            value={newGalleryItem[dusun.key]?.description || ''}
                            onChange={(e) => setNewGalleryItem(prev => ({
                              ...prev,
                              [dusun.key]: {
                                ...prev[dusun.key],
                                description: e.target.value
                              }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-gray-700"
                            placeholder="Enter image description"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Image
                          </label>
                          <label className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer text-center block">
                            {uploadingGallery[`gallery_${dusun.key}`] ? (
                              <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Uploading...
                              </span>
                            ) : (
                              'Choose File'
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleDusunGalleryUpload(i, file);
                              }}
                              disabled={uploadingGallery[`gallery_${dusun.key}`]}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Display Gallery Items */}
                    {dusun.gallery && dusun.gallery.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="text-md font-medium text-gray-900">Current Gallery ({dusun.gallery.length} items)</h5>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {dusun.gallery.map((galleryItem) => (
                            <div key={galleryItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
                              <div className="relative group">
                                <img
                                  src={galleryItem.image_url}
                                  alt={galleryItem.title}
                                  className="w-full h-48 object-cover"
                                  onError={() => {
                                    console.log('❌ Gallery image failed to load:', galleryItem.title, galleryItem.image_url);
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 flex items-center justify-center">
                                  <button
                                    onClick={() => handleDusunGalleryRemove(i, galleryItem.id)}
                                    disabled={uploadingGallery[`gallery_${dusun.key}_${galleryItem.id}`]}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                                  >
                                    {uploadingGallery[`gallery_${dusun.key}_${galleryItem.id}`] ? (
                                      <span className="flex items-center">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                        Removing...
                                      </span>
                                    ) : (
                                      'Remove'
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="p-4">
                                <h6 className="font-medium text-gray-900 text-sm mb-1">{galleryItem.title}</h6>
                                <p className="text-gray-600 text-xs mb-2">{galleryItem.description}</p>
                                <p className="text-gray-400 text-xs">
                                  {new Date(galleryItem.uploaded_at).toLocaleDateString('id-ID')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!dusun.gallery || dusun.gallery.length === 0) && (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">No gallery images yet. Add the first image above!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mb-12">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Gallery</h2>
              <p className="text-gray-600">Manage photo gallery for the village</p>
            </div>
            <button
              onClick={addGalleryItem}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Gallery Item
            </button>
          </div>
          
          {data.gallery.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">No gallery items yet. Click "Add Gallery Item" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.gallery.map((item, i) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="bg-gray-100 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                        📷
                      </span>
                      {item.title || `Gallery ${i + 1}`}
                    </h3>
                    <button
                      onClick={() => removeGalleryItem(i)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Gallery Image
                        </label>
                        
                        {item.image_url ? (
                          <div className="space-y-2">
                            <div className="relative group">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onLoad={() => console.log('✅ Gallery image loaded:', item.title, item.image_url)}
                                onError={() => console.log('❌ Gallery image failed to load:', item.title, item.image_url)}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                                  <label className="px-2 py-1 bg-blue-600 text-white text-xs rounded cursor-pointer hover:bg-blue-700 transition-colors">
                                    Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleGalleryImageUpload(i, file);
                                      }}
                                      disabled={uploading[`gallery_${i}`]}
                                    />
                                  </label>
                                  <button
                                    onClick={() => handleGalleryImageRemove(i)}
                                    disabled={uploading[`gallery_${i}`]}
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Hover to replace or remove</p>
                          </div>
                        ) : (
                          <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <div className="space-y-1">
                              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="text-xs text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                  <span>Upload image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleGalleryImageUpload(i, file);
                                    }}
                                    disabled={uploading[`gallery_${i}`]}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-500">JPG, PNG up to 3MB</p>
                            </div>
                          </div>
                        )}
                        
                        {uploading[`gallery_${i}`] && (
                          <div className="mt-2 flex items-center justify-center py-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="ml-1 text-blue-600 text-xs">Processing...</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleGalleryItemChange(i, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-700"
                          placeholder="Enter image title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleGalleryItemChange(i, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors h-16 resize-none text-sm text-gray-700"
                          placeholder="Enter image description"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pegawai Section */}
        <div className="mb-12">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Data Pegawai</h2>
              <p className="text-gray-600">Manage employee information and photos</p>
            </div>
            <button
              onClick={addPegawaiItem}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Employee
            </button>
          </div>
          
          {data.pegawai.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">No employees yet. Click "Add Employee" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.pegawai.map((item, i) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="bg-gray-100 text-gray-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                        👨‍💼
                      </span>
                      {item.nama || `Employee ${i + 1}`}
                    </h3>
                    <button
                      onClick={() => removePegawaiItem(i)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Employee Photo
                        </label>
                        
                        {item.foto_url ? (
                          <div className="space-y-2">
                            <div className="relative group">
                              <img
                                src={item.foto_url}
                                alt={item.nama}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onLoad={() => console.log('✅ Employee photo loaded:', item.nama, item.foto_url)}
                                onError={() => console.log('❌ Employee photo failed to load:', item.nama, item.foto_url)}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                                  <label className="px-2 py-1 bg-blue-600 text-white text-xs rounded cursor-pointer hover:bg-blue-700 transition-colors">
                                    Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handlePegawaiFotoUpload(i, file);
                                      }}
                                      disabled={uploading[`pegawai_${i}`]}
                                    />
                                  </label>
                                  <button
                                    onClick={() => handlePegawaiFotoRemove(i)}
                                    disabled={uploading[`pegawai_${i}`]}
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Hover to replace or remove</p>
                          </div>
                        ) : (
                          <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <div className="space-y-1">
                              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="text-xs text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                  <span>Upload photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handlePegawaiFotoUpload(i, file);
                                    }}
                                    disabled={uploading[`pegawai_${i}`]}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-500">JPG, PNG up to 3MB</p>
                            </div>
                          </div>
                        )}
                        
                        {uploading[`pegawai_${i}`] && (
                          <div className="mt-2 flex items-center justify-center py-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                            <span className="ml-1 text-blue-600 text-xs">Processing...</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nama Pegawai
                        </label>
                        <input
                          type="text"
                          value={item.nama}
                          onChange={(e) => handlePegawaiItemChange(i, 'nama', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-700"
                          placeholder="Enter employee name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Jabatan
                        </label>
                        <input
                          type="text"
                          value={item.jabatan}
                          onChange={(e) => handlePegawaiItemChange(i, 'jabatan', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-700"
                          placeholder="Enter position/title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Deskripsi
                        </label>
                        <textarea
                          value={item.deskripsi || ''}
                          onChange={(e) => handlePegawaiItemChange(i, 'deskripsi', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm text-gray-700 resize-vertical"
                          placeholder="Enter employee description (optional)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* KKN Gallery Section */}
        <div className="mb-12">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Galeri KKN 114</h2>
              <p className="text-gray-600">Manage photo gallery for KKN T 114 documentation</p>
            </div>
            <button
              onClick={addKknGalleryItem}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add KKN Photo
            </button>
          </div>
          
          {data.galeri_kkn.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600 text-lg mb-2">No KKN photos yet</p>
                <p className="text-gray-500">Click "Add KKN Photo" to start documenting KKN T 114 activities</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.galeri_kkn.map((item, i) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-900 flex items-center">
                      <span className="bg-purple-100 text-purple-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                        🎓
                      </span>
                      {item.title || `KKN Photo ${i + 1}`}
                    </h3>
                    <button
                      onClick={() => removeKknGalleryItem(i)}
                      className="px-2 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          KKN Photo
                        </label>
                        
                        {item.image_url ? (
                          <div className="space-y-2">
                            <div className="relative group">
                              <img
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                onLoad={() => console.log('✅ KKN gallery image loaded:', item.title, item.image_url)}
                                onError={() => console.log('❌ KKN gallery image failed to load:', item.title, item.image_url)}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                                  <label className="px-2 py-1 bg-purple-600 text-white text-xs rounded cursor-pointer hover:bg-purple-700 transition-colors">
                                    Replace
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleKknGalleryImageUpload(i, file);
                                      }}
                                      disabled={uploading[`kkn_gallery_${i}`]}
                                    />
                                  </label>
                                  <button
                                    onClick={() => handleKknGalleryImageRemove(i)}
                                    disabled={uploading[`kkn_gallery_${i}`]}
                                    className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500">Hover to replace or remove</p>
                          </div>
                        ) : (
                          <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <div className="space-y-1">
                              <svg className="mx-auto h-8 w-8 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="text-xs text-gray-600">
                                <label className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500">
                                  <span>Upload KKN photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleKknGalleryImageUpload(i, file);
                                    }}
                                    disabled={uploading[`kkn_gallery_${i}`]}
                                  />
                                </label>
                              </div>
                              <p className="text-xs text-gray-500">JPG, PNG up to 3MB</p>
                            </div>
                          </div>
                        )}
                        
                        {uploading[`kkn_gallery_${i}`] && (
                          <div className="mt-2 flex items-center justify-center py-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600"></div>
                            <span className="ml-1 text-purple-600 text-xs">Processing...</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleKknGalleryItemChange(i, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm text-gray-700"
                          placeholder="Enter photo title (e.g., 'Sosialisasi Program')"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => handleKknGalleryItemChange(i, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors h-16 resize-none text-sm text-gray-700"
                          placeholder="Enter photo description"
                        />
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

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaDownload, 
  FaFileAlt, 
  FaImage,
  FaSpinner, 
  FaSearch, 
  FaFilter, 
  FaNewspaper, 
  FaBook, 
  FaQuestionCircle,
  FaCalendarAlt, 
  FaExclamationTriangle, 
  FaTag, 
  FaSave, 
  FaTimes,
  FaToggleOn,
  FaToggleOff,
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFileImage,
  FaFileVideo,
  FaFileArchive,
  FaClock,
  FaStar,
  FaEye as FaEyeIcon,
  FaHeart,
  FaComments,
  FaUser,
  FaLink,
  FaChevronLeft,
  FaChevronRight,
  FaCog,
  FaChartBar,
  FaTrashAlt,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaDatabase,
  FaFile,
  FaInfoCircle
} from 'react-icons/fa';
import { format } from 'date-fns';

// ==================== TYPES ====================

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  article_count: number;
  resource_count: number;
}

interface Article {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string;
  category_id: number;
  category_name: string;
  tags: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_read_time: number;
  view_count: number;
  likes_count: number;
  is_featured: boolean;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  author: string;
  author_id: number;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  category_id: number;
  category_name: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  download_count: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category_id: number;
  category_name: string;
  display_order: number;
  is_active: boolean;
}

interface WeatherAlert {
  id: number;
  title: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  region: string;
  message: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  issued_by_name: string;
}

interface SeasonalGuide {
  id: number;
  title: string;
  season: string;
  crop_type: string;
  region: string;
  content: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

interface Stats {
  total_articles: number;
  published_articles: number;
  featured_articles: number;
  total_views: number;
  total_resources: number;
  total_downloads: number;
  total_faqs: number;
  active_alerts: number;
  topArticles: Article[];
  popularCategories: { name: string; article_count: number; total_views: number }[];
}

// ==================== STATUS BADGE COMPONENTS ====================

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
    isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`}>
    {isActive ? (
      <>
        <FaToggleOn className="mr-1" /> Active
      </>
    ) : (
      <>
        <FaToggleOff className="mr-1" /> Inactive
      </>
    )}
  </span>
);

const PublishBadge = ({ isPublished }: { isPublished: boolean }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center ${
    isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }`}>
    {isPublished ? 'Published' : 'Draft'}
  </span>
);

const DifficultyBadge = ({ level }: { level: string }) => {
  const colors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors.beginner}`}>
      {level}
    </span>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity] || colors.low}`}>
      {severity.toUpperCase()}
    </span>
  );
};

// ==================== FILE ICON COMPONENT ====================

const FileIcon = ({ fileType }: { fileType: string }) => {
  const type = fileType?.toLowerCase() || '';
  
  if (type.includes('pdf')) {
    return <FaFilePdf className="text-red-500 text-2xl" />;
  }
  if (type.includes('word') || type.includes('doc')) {
    return <FaFileWord className="text-blue-500 text-2xl" />;
  }
  if (type.includes('excel') || type.includes('sheet')) {
    return <FaFileExcel className="text-green-500 text-2xl" />;
  }
  if (type.includes('powerpoint') || type.includes('ppt')) {
    return <FaFilePowerpoint className="text-orange-500 text-2xl" />;
  }
  if (type.includes('image')) {
    return <FaFileImage className="text-purple-500 text-2xl" />;
  }
  if (type.includes('video')) {
    return <FaFileVideo className="text-pink-500 text-2xl" />;
  }
  if (type.includes('zip') || type.includes('rar')) {
    return <FaFileArchive className="text-yellow-500 text-2xl" />;
  }
  return <FaFileAlt className="text-gray-500 text-2xl" />;
};

// ==================== FORMAT FILE SIZE ====================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// ==================== RESOURCE MODAL ====================

interface ResourceModalProps {
  resource: Resource | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

const ResourceModal = ({ resource, categories, onClose, onSave }: ResourceModalProps) => {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    category_id: resource?.category_id?.toString() || '',
    description: resource?.description || '',
    is_featured: resource?.is_featured || false,
    is_active: resource?.is_active !== undefined ? resource.is_active : true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; size: string; type: string } | null>(
    resource ? {
      name: resource.file_name,
      size: formatFileSize(resource.file_size),
      type: resource.file_type
    } : null
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataObj = new FormData();
      
      formDataObj.append('title', String(formData.title));
      formDataObj.append('category_id', String(formData.category_id));
      formDataObj.append('description', String(formData.description));
      formDataObj.append('is_featured', String(formData.is_featured));
      formDataObj.append('is_active', String(formData.is_active));
      
      if (selectedFile) {
        formDataObj.append('file', selectedFile);
      }

      const url = resource 
        ? `${API_URL}/api/advisory/resources/${resource.id}`
        : `${API_URL}/api/advisory/resources`;
      
      const method = resource ? 'put' : 'post';

      await axios[method](url, formDataObj, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(resource ? 'Resource updated successfully' : 'Resource uploaded successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {resource ? 'Edit Resource' : 'Upload New Resource'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Describe what this resource contains..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition cursor-pointer"
                   onClick={() => document.getElementById('file-upload')?.click()}>
                <input
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.rar"
                />
                <FaCloudUploadAlt className="text-4xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">
                  {fileInfo ? fileInfo.name : 'Click or drag file to upload'}
                </p>
                {fileInfo && (
                  <div className="mt-2 text-sm text-gray-500">
                    <span className="mr-3">{fileInfo.size}</span>
                    <span>{fileInfo.type}</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Supported formats: PDF, DOC, XLS, PPT, Images, Videos, ZIP (Max 50MB)
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Feature this resource</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Active (visible to farmers)</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (!resource && !selectedFile)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaUpload className="mr-2" />}
                {resource ? 'Update Resource' : 'Upload Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== ARTICLE MODAL ====================

interface ArticleModalProps {
  article: Article | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

const ArticleModal = ({ article, categories, onClose, onSave }: ArticleModalProps) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    category_id: article?.category_id?.toString() || '',
    summary: article?.summary || '',
    content: article?.content || '',
    tags: article?.tags?.join(', ') || '',
    difficulty_level: article?.difficulty_level || 'beginner',
    estimated_read_time: article?.estimated_read_time || 5,
    is_featured: article?.is_featured || false,
    is_published: article?.is_published || false
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(article?.featured_image || '');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const formDataObj = new FormData();
      
      formDataObj.append('title', String(formData.title));
      formDataObj.append('category_id', String(formData.category_id));
      formDataObj.append('summary', String(formData.summary));
      formDataObj.append('content', String(formData.content));
      
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      formDataObj.append('tags', JSON.stringify(tagsArray));
      
      formDataObj.append('difficulty_level', String(formData.difficulty_level));
      formDataObj.append('estimated_read_time', String(formData.estimated_read_time));
      formDataObj.append('is_featured', String(formData.is_featured));
      formDataObj.append('is_published', String(formData.is_published));
      
      if (featuredImage) {
        formDataObj.append('featured_image', featuredImage);
      }

      const url = article 
        ? `${API_URL}/api/advisory/articles/${article.id}`
        : `${API_URL}/api/advisory/articles`;
      
      const method = article ? 'put' : 'post';

      await axios[method](url, formDataObj, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success(article ? 'Article updated successfully' : 'Article created successfully');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {article ? 'Edit Article' : 'Create New Article'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FaTimes size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Summary *</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={12}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="maize, farming, irrigation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                <select
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Est. Read Time (minutes)</label>
                <input
                  type="number"
                  value={formData.estimated_read_time}
                  onChange={(e) => setFormData({ ...formData, estimated_read_time: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Feature this article</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Publish immediately</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
                {article ? 'Update Article' : 'Create Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ==================== MAIN PAGE COMPONENT ====================

export default function AdminAdvisoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'articles' | 'resources' | 'faqs' | 'seasonal' | 'alerts' | 'categories' | 'stats'>('resources');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [seasonalGuides, setSeasonalGuides] = useState<SeasonalGuide[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch categories (always needed)
      const categoriesRes = await axios.get(`${API_URL}/api/advisory/categories`);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);

      switch (activeTab) {
        case 'articles':
          const articlesRes = await axios.get(`${API_URL}/api/advisory/articles?limit=100`, { headers });
          if (articlesRes.data.success) setArticles(articlesRes.data.articles);
          break;
        case 'resources':
          const resourcesRes = await axios.get(`${API_URL}/api/advisory/resources`, { headers });
          if (resourcesRes.data.success) setResources(resourcesRes.data.resources);
          break;
        case 'faqs':
          const faqsRes = await axios.get(`${API_URL}/api/advisory/faqs`);
          if (faqsRes.data.success) {
            const allFaqs = faqsRes.data.faqs.flatMap((g: any) => g.faqs);
            setFaqs(allFaqs);
          }
          break;
        case 'alerts':
          const alertsRes = await axios.get(`${API_URL}/api/advisory/weather-alerts`);
          if (alertsRes.data.success) setAlerts(alertsRes.data.alerts);
          break;
        case 'seasonal':
          const seasonalRes = await axios.get(`${API_URL}/api/advisory/seasonal-guides`);
          if (seasonalRes.data.success) setSeasonalGuides(seasonalRes.data.guides);
          break;
        case 'stats':
          const statsRes = await axios.get(`${API_URL}/api/advisory/admin/stats`, { headers });
          if (statsRes.data.success) setStats(statsRes.data.stats);
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/advisory/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Article deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/advisory/resources/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Resource deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Failed to delete resource');
    }
  };

  const handleTogglePublish = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/advisory/articles/${id}`, 
        { is_published: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Article ${!currentStatus ? 'published' : 'unpublished'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update article status');
    }
  };

  const handleToggleResourceActive = async (id: number, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/advisory/resources/${id}`, 
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Resource ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error toggling resource status:', error);
      toast.error('Failed to update resource status');
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || resource.category_id.toString() === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && resource.is_active) ||
                          (statusFilter === 'inactive' && !resource.is_active);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-5xl text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer position="top-right" />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Advisory Content Management</h1>
              <p className="text-green-100 mt-2">Manage agricultural information, resources, and guides</p>
            </div>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-2 bg-white text-green-800 rounded-lg hover:bg-green-50 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto">
          <div className="flex border-b border-gray-200 min-w-max">
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'articles'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaNewspaper className="inline mr-2" /> Articles ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'resources'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaFileAlt className="inline mr-2" /> Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('faqs')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'faqs'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaQuestionCircle className="inline mr-2" /> FAQs ({faqs.length})
            </button>
            <button
              onClick={() => setActiveTab('seasonal')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'seasonal'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaCalendarAlt className="inline mr-2" /> Seasonal Guides ({seasonalGuides.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'alerts'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaExclamationTriangle className="inline mr-2" /> Weather Alerts ({alerts.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'categories'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaTag className="inline mr-2" /> Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 text-sm font-medium transition ${
                activeTab === 'stats'
                  ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChartBar className="inline mr-2" /> Statistics
            </button>
          </div>
        </div>

        {/* Resources Tab Content */}
        {activeTab === 'resources' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setEditingResource(null);
                  setShowResourceModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <FaPlus className="mr-2" /> Upload Resource
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Info</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredResources.map(resource => (
                      <tr key={resource.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <FileIcon fileType={resource.file_type} />
                            <div>
                              <div className="font-medium text-gray-900">{resource.title}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{resource.description}</div>
                              {resource.is_featured && (
                                <div className="flex items-center mt-1">
                                  <FaStar className="text-yellow-500 text-xs mr-1" />
                                  <span className="text-xs text-yellow-600">Featured</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{resource.category_name}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{resource.file_name}</div>
                          <div className="text-xs text-gray-500">{formatFileSize(resource.file_size)}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{resource.download_count}</td>
                        <td className="px-6 py-4">
                          <StatusBadge isActive={resource.is_active} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(resource.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingResource(resource);
                                setShowResourceModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleToggleResourceActive(resource.id, resource.is_active)}
                              className="text-purple-600 hover:text-purple-800"
                              title={resource.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {resource.is_active ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredResources.length === 0 && (
                <div className="text-center py-12">
                  <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No resources found</p>
                  <button
                    onClick={() => {
                      setEditingResource(null);
                      setShowResourceModal(true);
                    }}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Upload Your First Resource
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Articles Tab Content */}
        {activeTab === 'articles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  setEditingArticle(null);
                  setShowArticleModal(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <FaPlus className="mr-2" /> New Article
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {articles.map(article => (
                      <tr key={article.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{article.title}</div>
                          <div className="text-xs text-gray-500 mt-1">/{article.slug}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{article.category_name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <PublishBadge isPublished={article.is_published} />
                            {article.is_featured && (
                              <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 flex items-center">
                                <FaStar className="mr-1 text-xs" /> Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <DifficultyBadge level={article.difficulty_level} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaEyeIcon className="mr-1 text-gray-400" /> {article.view_count}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {article.published_at ? new Date(article.published_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/advisory/article/${article.slug}`)}
                              className="text-blue-600 hover:text-blue-800"
                              title="View"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => {
                                setEditingArticle(article);
                                setShowArticleModal(true);
                              }}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleTogglePublish(article.id, article.is_published)}
                              className="text-purple-600 hover:text-purple-800"
                              title={article.is_published ? 'Unpublish' : 'Publish'}
                            >
                              {article.is_published ? <FaToggleOn /> : <FaToggleOff />}
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {articles.length === 0 && (
                <div className="text-center py-12">
                  <FaNewspaper className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No articles found</p>
                  <button
                    onClick={() => {
                      setEditingArticle(null);
                      setShowArticleModal(true);
                    }}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Create Your First Article
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && stats && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Articles</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.total_articles}</p>
                  </div>
                  <FaNewspaper className="text-4xl text-green-200" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Published Articles</p>
                    <p className="text-3xl font-bold text-green-600">{stats.published_articles}</p>
                  </div>
                  <FaCheckCircle className="text-4xl text-green-200" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_views.toLocaleString()}</p>
                  </div>
                  <FaEyeIcon className="text-4xl text-blue-200" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Resources</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.total_resources}</p>
                  </div>
                  <FaDownload className="text-4xl text-purple-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Articles by Views</h3>
              <div className="space-y-4">
                {stats.topArticles.map(article => (
                  <div key={article.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{article.title}</p>
                      <p className="text-sm text-gray-500">{article.category_name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 flex items-center">
                        <FaEyeIcon className="mr-1" /> {article.view_count}
                      </span>
                      <button
                        onClick={() => router.push(`/advisory/article/${article.slug}`)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Categories</h3>
              <div className="space-y-4">
                {stats.popularCategories.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{cat.name}</span>
                      <span className="text-gray-500">{cat.article_count} articles • {cat.total_views.toLocaleString()} views</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(cat.total_views / stats.total_views) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'articles' && activeTab !== 'resources' && activeTab !== 'stats' && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <FaCog className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-500">
              Management for {activeTab} is under development.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showArticleModal && (
        <ArticleModal
          article={editingArticle}
          categories={categories}
          onClose={() => {
            setShowArticleModal(false);
            setEditingArticle(null);
          }}
          onSave={fetchData}
        />
      )}

      {showResourceModal && (
        <ResourceModal
          resource={editingResource}
          categories={categories}
          onClose={() => {
            setShowResourceModal(false);
            setEditingResource(null);
          }}
          onSave={fetchData}
        />
      )}
    </div>
  );
}
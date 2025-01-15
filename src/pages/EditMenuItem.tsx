import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { AlertCircle, ArrowLeft, Plus, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  restaurant_id: string;
}

export default function EditMenuItem() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  
  const [menuItem, setMenuItem] = useState({
    name: "",
    description: "",
    price: "",
    image: null as File | null,
    imagePreview: null as string | null,
    currentImageUrl: null as string | null
  });

  useEffect(() => {
    if (profile?.id && id) {
      fetchMenuItemAndCategories();
    }
  }, [profile?.id, id]);

  const fetchMenuItemAndCategories = async () => {
    try {
      setIsLoading(true);

      // Fetch menu item
      const { data: itemData, error: itemError } = await supabase
        .from("menu_items")
        .select("*")
        .eq("id", id)
        .single();

      if (itemError) throw itemError;

      if (itemData) {
        // Fetch categories for the restaurant
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("*")
          .eq("restaurant_id", itemData.restaurant_id);

        if (categoriesError) throw categoriesError;

        setCategories(categoriesData || []);
        setSelectedCategory(itemData.category);
        setMenuItem({
          name: itemData.name,
          description: itemData.description || "",
          price: itemData.price.toString(),
          image: null,
          imagePreview: null,
          currentImageUrl: itemData.image_url
        });
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMenuItem(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const { data: itemData } = await supabase
        .from("menu_items")
        .select("restaurant_id")
        .eq("id", id)
        .single();

      if (!itemData) throw new Error("Menu item not found");

      const { data, error } = await supabase
        .from("menu_categories")
        .insert([
          {
            name: newCategory.trim(),
            restaurant_id: itemData.restaurant_id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setCategories(prev => [...prev, data]);
      setSelectedCategory(data.id);
      setNewCategory("");
      setShowNewCategoryInput(false);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !id) return;

    try {
      setIsLoading(true);
      let imageUrl = menuItem.currentImageUrl;

      // Upload new image if exists
      if (menuItem.image) {
        const fileExt = menuItem.image.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("menu-items")
          .upload(fileName, menuItem.image);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from("menu-items")
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      // Update menu item
      const { error: updateError } = await supabase
        .from("menu_items")
        .update({
          name: menuItem.name,
          description: menuItem.description,
          price: parseFloat(menuItem.price),
          category: selectedCategory,
          image_url: imageUrl
        })
        .eq("id", id);

      if (updateError) throw updateError;

      navigate(-1); // Go back to menu management
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Menu
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Menu Item</h1>

          {error && (
            <div className="mb-6 flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {(menuItem.imagePreview || menuItem.currentImageUrl) ? (
                    <div className="relative inline-block">
                      <img
                        src={menuItem.imagePreview || menuItem.currentImageUrl || ""}
                        alt="Preview"
                        className="max-h-48 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setMenuItem(prev => ({ 
                          ...prev, 
                          image: null, 
                          imagePreview: null,
                          currentImageUrl: null 
                        }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Plus className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer rounded-md font-medium text-orange-600 hover:text-orange-500">
                          <span>Upload a file</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Item Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={menuItem.name}
                onChange={(e) => setMenuItem(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={menuItem.description}
                onChange={(e) => setMenuItem(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  value={menuItem.price}
                  onChange={(e) => setMenuItem(prev => ({ ...prev, price: e.target.value }))}
                  className="block w-full pl-7 rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <div className="mt-1 space-y-2">
                {showNewCategoryInput ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="block w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      placeholder="Category name"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <select
                      id="category"
                      required
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="block w-full rounded-md border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowNewCategoryInput(true)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      New Category
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white
                  ${isLoading 
                    ? 'bg-orange-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700'}
                `}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white rounded-full animate-spin border-t-transparent" />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

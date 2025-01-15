import React, { useState, useEffect } from "react";
import { Menu, Plus, Edit2, Trash2, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
}

interface MenuCategory {
  id: string;
  name: string;
}

export default function MenuManagement() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.id) {
      fetchRestaurantId();
    }
  }, [profile?.id]);

  const fetchRestaurantId = async () => {
    try {
      const { data, error } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", profile?.id)
        .single();

      if (error) throw error;

      if (data) {
        setRestaurantId(data.id);
        fetchMenuData(data.id);
      }
    } catch (error: any) {
      console.error("Error fetching restaurant:", error.message);
      setMessage({ type: "error", text: "Failed to load restaurant data" });
    }
  };

  const fetchMenuData = async (restId: string) => {
    try {
      setIsLoading(true);
      
      // First fetch the menu for the restaurant
      const { data: menuData, error: menuError } = await supabase
        .from("menus")
        .select("id")
        .eq("restaurant_id", restId)
        .single();

      if (menuError) throw menuError;

      // Then fetch categories for the menu
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("menu_categories")
        .select("*")
        .eq("menu_id", menuData.id);

      if (categoriesError) throw categoriesError;

      // Finally fetch menu items for these categories
      const categoryIds = categoriesData?.map(cat => cat.id) || [];
      const { data: itemsData, error: itemsError } = await supabase
        .from("menu_items")
        .select("*")
        .in("category_id", categoryIds);

      if (itemsError) throw itemsError;

      if (categoriesError) throw categoriesError;

      setMenuItems(itemsData || []);
      setCategories(categoriesData || []);
    } catch (error: any) {
      console.error("Error fetching menu data:", error.message);
      setMessage({ type: "error", text: "Failed to load menu data" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMenu = () => {
    navigate("/create-menu");
  };

  const handleEditItem = (itemId: string) => {
    navigate(`/edit-menu-item/${itemId}`);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setMenuItems(prev => prev.filter(item => item.id !== itemId));
      setMessage({ type: "success", text: "Menu item deleted successfully" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Menu className="w-6 h-6 text-orange-500" />
          <h2 className="text-xl font-semibold text-gray-900">Menu Management</h2>
        </div>
        <button
          onClick={handleCreateMenu}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Menu Item
        </button>
      </div>

      {message && (
        <div className={`
          flex items-center space-x-2 p-4 rounded-lg mb-6
          ${message.type === "success" 
            ? "bg-green-50 text-green-800" 
            : "bg-red-50 text-red-800"}
        `}>
          {message.type === "success" 
            ? <CheckCircle className="w-5 h-5 text-green-600" /> 
            : <AlertCircle className="w-5 h-5 text-red-600" />}
          <p>{message.text}</p>
        </div>
      )}

      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No menu categories yet. Start by adding a menu item.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map(category => (
            <div key={category.id}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems
                  .filter(item => item.category_id === category.id)
                  .map(item => (
                    <div
                      key={item.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="font-medium text-orange-600">
                          ${item.price.toFixed(2)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditItem(item.id)}
                            className="p-1 text-gray-500 hover:text-orange-500"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api';
import { setUser } from '@/store/slices/authSlice';
import { User, Mail, Calendar, Shield, Edit3, Save, X, Lock, Eye, EyeOff, Camera, Upload } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; email?: string }) => authAPI.updateProfile(data),
    onSuccess: (response) => {
      // Update user in Redux store
      dispatch(setUser(response.data));
      setIsEditing(false);
      setErrors({});
      
      // Show success message
      alert('อัปเดตโปรไฟล์สำเร็จ!');
    },
    onError: (error: any) => {
      console.error('Profile update error:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตโปรไฟล์';
      setErrors({ general: errorMessage });
    }
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      authAPI.changePassword(data),
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      
      // Show success message
      alert('เปลี่ยนรหัสผ่านสำเร็จ!');
    },
    onError: (error: any) => {
      console.error('Password change error:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน';
      setErrors({ password: errorMessage });
    }
  });

  // Upload profile image mutation
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => authAPI.uploadProfileImage(file),
    onSuccess: (response) => {
      // Update user in Redux store
      dispatch(setUser(response.data.user));
      setIsUploadingImage(false);
      
      // Show success message
      alert('อัปโหลดรูปโปรไฟล์สำเร็จ!');
    },
    onError: (error: any) => {
      console.error('Image upload error:', error);
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ';
      setErrors({ image: errorMessage });
      setIsUploadingImage(false);
    }
  });
  
  // Handle profile form submission
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    if (!profileForm.name.trim()) {
      setErrors({ name: 'กรุณากรอกชื่อ' });
      return;
    }
    
    if (!profileForm.email.trim()) {
      setErrors({ email: 'กรุณากรอกอีเมล' });
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      setErrors({ email: 'รูปแบบอีเมลไม่ถูกต้อง' });
      return;
    }
    
    updateProfileMutation.mutate(profileForm);
  };
  
  // Handle password form submission
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validation
    if (!passwordForm.currentPassword) {
      setErrors({ currentPassword: 'กรุณากรอกรหัสผ่านปัจจุบัน' });
      return;
    }
    
    if (!passwordForm.newPassword) {
      setErrors({ newPassword: 'กรุณากรอกรหัสผ่านใหม่' });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setErrors({ newPassword: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ confirmPassword: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };
  
  // Reset forms when canceling
  const handleCancelEdit = () => {
    setIsEditing(false);
    setProfileForm({
      name: user?.name || '',
      email: user?.email || ''
    });
    setErrors({});
  };
  
  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  // Handle profile image upload
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      setErrors({ image: 'รองรับเฉพาะไฟล์รูปภาพ (jpg, jpeg, png, gif)' });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ image: 'ขนาดไฟล์ต้องไม่เกิน 5MB' });
      return;
    }

    setErrors({});
    setIsUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          โปรไฟล์
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชีของคุณ
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profileImage ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${user.profileImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-600 dark:text-gray-300" />
                )}
              </div>
              
              {/* Upload button overlay */}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isUploadingImage}
                />
                {isUploadingImage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
              </label>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.name || 'ไม่ระบุชื่อ'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {user?.email}
              </p>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.role || 'USER'}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    สมาชิกตั้งแต่ {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH') : 'ไม่ทราบ'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'ยกเลิก' : 'แก้ไข'}
            </button>
            
            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="flex items-center px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              <Lock className="w-4 h-4 mr-2" />
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            ข้อมูลส่วนตัว
          </h3>
          
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}
          
          {errors.image && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.image}</p>
            </div>
          )}
          
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ชื่อ
              </label>
              <input
                type="text"
                value={isEditing ? profileForm.name : (user?.name || '')}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                readOnly={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isEditing 
                    ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                } ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                value={isEditing ? profileForm.email : (user?.email || '')}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                readOnly={!isEditing}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isEditing 
                    ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white'
                } ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                บทบาท
              </label>
              <input
                type="text"
                value={user?.role || 'USER'}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            {isEditing && (
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                >
                  {updateProfileMutation.isPending ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {updateProfileMutation.isPending ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิก
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            เปลี่ยนรหัสผ่าน
          </h3>
          
          {errors.password && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            </div>
          )}
          
          {isChangingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  รหัสผ่านปัจจุบัน
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.currentPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.newPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                >
                  {changePasswordMutation.isPending ? (
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {changePasswordMutation.isPending ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelPasswordChange}
                  className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิก
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                คลิกปุ่ม "เปลี่ยนรหัสผ่าน" ด้านบนเพื่อเปลี่ยนรหัสผ่านของคุณ
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
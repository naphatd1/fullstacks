"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { useQuery, useMutation } from "@tanstack/react-query";
import { authStorage } from "@/lib/auth-storage";
import { useAppSelector } from "@/store/hooks";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";



type FormData = {
  title: string;
  content?: string;
};

const EditPostPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const [published, setPublished] = useState(false);
  const postId = params.id as string;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // Fetch post data
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const token = authStorage.getAccessToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/${postId}`,
        {
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        if (response.status === 404) {
          throw new Error("Post not found");
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!user && !!postId,
  });

  // Set form values when post data is loaded
  useEffect(() => {
    if (post) {
      setValue("title", post.title || "");
      setValue("content", post.content || "");
      setPublished(post.published || false);
    }
  }, [post, setValue]);

  const updateMutation = useMutation({
    mutationFn: async (data: FormData & { published: boolean }) => {
      const token = authStorage.getAccessToken();
      if (!token) {
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/posts/${postId}`,
        {
          method: "PATCH",
          cache: "no-store",
          mode: "cors",
          credentials: "omit",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Authentication failed. Please login again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("อัปเดตโพสต์สำเร็จ!");
      router.push("/posts");
    },
    onError: (error: any) => {
      console.error("Update post error:", error);
      if (error.message.includes("Authentication")) {
        toast.error("กรุณาเข้าสู่ระบบใหม่");
      } else if (error.message.includes("not found")) {
        toast.error("ไม่พบโพสต์ที่ต้องการแก้ไข");
      } else {
        toast.error(error.message || "อัปเดตโพสต์ไม่สำเร็จ");
      }
    },
  });

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({ ...data, published });
  };

  const watchedContent = watch("content", "");

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            คุณต้องเข้าสู่ระบบเพื่อแก้ไขโพสต์
          </p>
        </div>
      </div>
    );
  }

  if (postLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ไม่พบโพสต์
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            โพสต์ที่คุณต้องการแก้ไขไม่พบหรือถูกลบไปแล้ว
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปหน้าโพสต์
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/posts"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            กลับไปหน้าโพสต์
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              เผยแพร่ทันที
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              หัวข้อ
            </label>
            <input
              {...register("title")}
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              placeholder="ใส่หัวข้อโพสต์..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              เนื้อหา
            </label>
            <textarea
              {...register("content")}
              rows={12}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              placeholder="เขียนเนื้อหาโพสต์ที่นี่..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.content.message}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {watchedContent?.length || 0}/10000 ตัวอักษร
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/posts"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
            >
              {updateMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  กำลังอัปเดต...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {published ? "อัปเดตและเผยแพร่" : "บันทึกร่าง"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Post Info */}
      {post && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            ข้อมูลโพสต์
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>
              สร้างเมื่อ: {new Date(post.createdAt).toLocaleString("th-TH")}
            </p>
            {post.updatedAt && post.updatedAt !== post.createdAt && (
              <p>
                แก้ไขล่าสุด: {new Date(post.updatedAt).toLocaleString("th-TH")}
              </p>
            )}
            <p>สถานะ: {post.published ? "เผยแพร่แล้ว" : "ร่าง"}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPostPage;

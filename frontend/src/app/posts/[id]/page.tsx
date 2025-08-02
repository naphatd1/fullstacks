"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { authStorage } from "@/lib/auth-storage";
import { useAppSelector } from "@/store/hooks";
import { ArrowLeft, Edit, Calendar, User, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const ViewPostPage: React.FC = () => {
  const params = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const postId = params.id as string;

  // Fetch post data
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
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

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            กรุณาเข้าสู่ระบบ
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            คุณต้องเข้าสู่ระบบเพื่อดูโพสต์
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ไม่พบโพสต์
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            โพสต์ที่คุณต้องการดูไม่พบหรือถูกลบไปแล้ว
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
        <Link
          href="/posts"
          className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          กลับไปหน้าโพสต์
        </Link>

        {/* Check if current user is the author */}
        {user.id === post.authorId && (
          <Link
            href={`/posts/${postId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            แก้ไขโพสต์
          </Link>
        )}
      </div>

      {/* Post Content */}
      <article className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="p-6">
          {/* Post Header */}
          <header className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.published
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                      : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400"
                  }`}
                >
                  {post.published ? (
                    <>
                      <Eye className="h-3 w-3 mr-1" />
                      เผยแพร่แล้ว
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3 w-3 mr-1" />
                      ร่าง
                    </>
                  )}
                </span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>
                  {post.author?.name || post.author?.email || "ไม่ระบุผู้เขียน"}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  สร้างเมื่อ {new Date(post.createdAt).toLocaleString("th-TH")}
                </span>
              </div>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    แก้ไขล่าสุด{" "}
                    {new Date(post.updatedAt).toLocaleString("th-TH")}
                  </span>
                </div>
              )}
            </div>
          </header>

          {/* Post Content */}
          <div className="prose prose-gray dark:prose-invert max-w-none">
            {post.content ? (
              <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                {post.content}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic">
                ไม่มีเนื้อหา
              </p>
            )}
          </div>
        </div>
      </article>

      {/* Post Stats */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          สถิติโพสต์
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">สถานะ:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {post.published ? "เผยแพร่แล้ว" : "ร่าง"}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">
              จำนวนตัวอักษร:
            </span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {post.content?.length || 0}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">จำนวนคำ:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {post.content
                ? post.content
                    .split(/\s+/)
                    .filter((word: string) => word.length > 0).length
                : 0}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">ID:</span>
            <span className="ml-2 font-mono text-xs text-gray-900 dark:text-white">
              {post.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPostPage;

"use client";
import type React from "react";
import { Inter } from "next/font/google";
import { App, ConfigProvider, Layout, Button, Dropdown, Avatar, Badge, MenuProps } from "antd";
import {
  BookOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { theme } from "@/lib/theme";
import { useAuth, AuthGuard } from "@/lib/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";

const { Header, Content, Footer } = Layout;

function AppHeader() {
  const { user, signOut } = useAuth()
  const items: MenuProps['items'] = [
    {
      label: 'Sign Out',
      key: 'logout',
      icon: <LogoutOutlined />,
      onClick: signOut,
    },
  ];

  return (
    <Header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/quizzes" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:bg-emerald-400 transition-all duration-200">
              <BookOutlined className="text-white text-base" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white tracking-tight">
                QuizMaster
              </h1>
              <p className="text-xs text-slate-400 -mt-1">
                Create & Share Quizzes
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {user ?
            <Dropdown menu={{ items }} trigger={['click']}>
              <Button type="text"
                className="h-9 px-3 rounded-lg hover:bg-slate-800 transition-all duration-200 flex items-center space-x-2"
              >
                <Avatar size={28} icon={<UserOutlined />} className="bg-emerald-600!"
                />
                <span className="hidden sm:block text-slate-300 font-medium text-sm">
                  {user.email?.split('@')[0]} </span>
              </Button>

            </Dropdown>
            :
            <Link href="/login">
              <Button
                type="primary"
                className="h-9 px-5 bg-emerald-500 hover:bg-emerald-400 border-0 rounded-lg font-semibold shadow-md shadow-emerald-500/20 transition-all duration-200"
              >
                Sign In
              </Button>
            </Link>}
        </div>
      </div>
    </Header>
  );
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient()
  return (

    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={theme}>
        <App>
          <AuthGuard>
            <Layout className="min-h-screen bg-slate-50">
              <AppHeader />
              <Content className="pt-16">
                <div className="min-h-[calc(100vh-64px)]">{children}</div>
              </Content>
              <Footer className="text-center bg-slate-900 border-t border-slate-800 py-6">
                footer
              </Footer>
            </Layout>
          </AuthGuard>
        </App>
      </ConfigProvider>
    </QueryClientProvider>

  );
}

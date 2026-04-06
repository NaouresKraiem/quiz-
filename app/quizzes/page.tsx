'use client'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import QuizCard from '../componenets/QuizCard'
import { Col, Input, Pagination, Row, Spin } from 'antd'

import { SearchOutlined } from "@ant-design/icons"
import Title from 'antd/es/typography/Title'
import Paragraph from 'antd/es/typography/Paragraph'
import { useAuth } from '@/lib/auth'
import { getQuizzes } from '../api/quizzes'
import '../globals.css'
const QuizzesPage = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const { user } = useAuth()

    const limit = 6

    const { data: quizzes, isLoading, isFetching } = useQuery({
        queryKey: ['quizzes', searchTerm, limit, currentPage],
        queryFn: () => getQuizzes(currentPage, limit, searchTerm),
        enabled: !!user,
    });

    const handleChngePage = (page: number) => {
        setCurrentPage(page)
    }

    const total = quizzes?.total ?? 0
    const data = quizzes?.data ?? []

    return (

        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                        <div>
                            <Title
                                level={1}
                                className="mb-2 text-slate-800"
                            >
                                Discover Quizzes
                            </Title>
                            <Paragraph className="text-base text-slate-500 mb-0 max-w-xl">
                                Test your knowledge, challenge your friends, and learn something new
                            </Paragraph>
                        </div>

                        <div className="w-full sm:w-72">
                            <Input
                                size="large"
                                placeholder="Search quizzes..."
                                prefix={<SearchOutlined className="text-slate-400" />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 border-slate-200 rounded-lg hover:border-emerald-400 focus:border-emerald-500 transition-all duration-200"
                            />
                        </div>
                    </div>
                </div>



                {/* Stats Bar */}
                <div className="flex justify-between items-center mb-6 px-5 py-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center space-x-5">
                        <div className="text-center">
                            <div className="text-xl font-bold text-emerald-600">{total}</div>
                            <div className="text-xs text-slate-500 font-medium">Total Quizzes</div>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {isFetching && <Spin className="mr-2" />}
                        <span className="text-sm text-slate-400">
                            Showing {(currentPage - 1) * limit + 1}-
                            {Math.min(currentPage * limit, total)} of {total}
                        </span>
                    </div>
                </div>
                {/* card */}
                <div
                    className={`transition-all duration-300 ${isFetching ? "opacity-60" : "opacity-100"}`}
                >
                    <Row gutter={[24, 24]}>
                        {data?.map((quiz, index) => (
                            <Col key={quiz.id} xs={24} md={12} lg={8}>
                                <div
                                    className="animate-fade-in-up"
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <QuizCard quiz={quiz} />
                                </div>
                            </Col>
                        ))}
                    </Row>
                </div>
                {/* pagination */}
                {total > limit && (
                    <div className="flex justify-center mt-10">
                        <div className="bg-white rounded-xl px-4 py-3 border border-slate-200 shadow-sm">
                            <Pagination
                                current={currentPage}
                                pageSize={limit}
                                total={total}
                                onChange={handleChngePage}
                                showSizeChanger={false}
                                showQuickJumper
                                disabled={isFetching}
                                className="custom-pagination"
                            />
                        </div>
                    </div>
                )}


            </div>


        </div>
    )


}

export default QuizzesPage

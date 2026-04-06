"use client"
import { useState } from 'react';
import * as yup from "yup";
import {
    LockOutlined,
    MailOutlined
} from "@ant-design/icons";
import Title from 'antd/es/typography/Title';
import Text from 'antd/es/typography/Text';
import { Button, Card, Divider, Form, Input } from 'antd';
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/lib/auth';
import { useAntdApp } from '@/lib/useAntdApp';
import { useRouter } from "next/navigation";


const loginSchema = yup.object({
    email: yup
        .string()
        .required("Please input your email!")
        .email("Please enter a valid email address"),
    password: yup
        .string()
        .required("Please input your password!")
        .min(6, "Password must be at least 6 characters"),
})

const Page = () => {
    const { message } = useAntdApp()
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const { signIn, signUp } = useAuth()
    const router = useRouter()
    const { control, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(loginSchema) })
    const onSubmit = async (values: any) => {
        console.log('onSubmit:')
        setLoading(true)
        try {
            if (isSignUp) {
                const { error } = await signUp(values.email, values.password)
                if (error) {
                    message.error(error.message)
                } else {
                    message.success("Account created! Please check your email to confirm your account.")
                    setIsSignUp(false)

                }
            } else {
                const { error } = await signIn(values.email, values.password)
                if (error) {
                    message.error(error.message)
                } else {
                    message.success("Login successful")
                    // router.push('')
                    router.push('/quizzes')

                }
            }

        } catch (error: any) {
            message.error(error.message || 'An error ocuured')
        } finally {
            setLoading(false)
        }
    }

    return (

        <div className="flex justify-center items-center min-h-screen bg-slate-50">
            <div className="w-full max-w-md px-4">
                <div className='text-center mb-8'>
                    <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                        <LockOutlined className="text-white text-2xl" />
                    </div>
                    <Title level={2} className="text-slate-800 mb-1">{isSignUp ? 'Create an Account' : 'Welcome Back'}</Title>
                    <Text className="text-slate-500">
                        {isSignUp ? "Sign up to create and take quizzes" : "Sign in to access your quizzes"}
                    </Text>
                </div>
                <Card className="border border-slate-200 shadow-lg shadow-slate-200/50 rounded-xl">
                    <Form layout='vertical' onFinish={handleSubmit(onSubmit)}>
                        <Form.Item label='Email'
                            validateStatus={errors.email ? "error" : undefined}
                            help={errors.email?.message}
                        >
                            <Controller
                                name='email'
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        prefix={<MailOutlined className="text-slate-400" />}
                                        size="large"
                                        className="rounded-lg"
                                        placeholder='Email'
                                    />
                                )
                                }
                            />

                        </Form.Item>
                        <Form.Item
                            label='Password'
                            validateStatus={errors.password ? "error" : undefined}
                            help={errors.password?.message}
                        >
                            <Controller
                                name='password'
                                control={control}
                                render={({ field }) => (
                                    <Input.Password
                                        {...field}
                                        prefix={<LockOutlined className="text-slate-400" />}
                                        size="large"
                                        className="rounded-lg"
                                        placeholder='Password'
                                    />
                                )
                                }
                            />
                        </Form.Item>
                        <Button
                            type='primary'
                            htmlType='submit'
                            size='large'
                            loading={loading}
                            block
                            className="h-11 bg-emerald-500 hover:bg-emerald-600 border-0 rounded-lg font-semibold shadow-md shadow-emerald-500/20"
                        >
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </Button>



                    </Form>
                    <Divider plain className="text-slate-400">Or</Divider>
                    <div className='text-center'>
                        <Button className="text-emerald-600 hover:text-emerald-700 font-medium" type='link' onClick={() => setIsSignUp(!isSignUp)}>
                            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                        </Button>
                    </div>
                </Card >
            </div>

        </div>
    )
}

export default Page

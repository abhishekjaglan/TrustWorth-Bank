'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomInput from './CustomInput'  
import { authFormSchema } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getLoggedInUser, signIn, signUp } from '@/lib/actions/user.actions'
import PlaidLink from './PlaidLink'

const AuthForm = ({type} : {type: string}) => {
    const router = useRouter();
    const [user, setuser] = useState(null);
    const [isLaoding, setIsLaoding] = useState(false);

    const formSchema = authFormSchema(type);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async(data: z.infer<typeof formSchema>) => {

        setIsLaoding(true);
        
        try {          

            const userData = {
                firstName: data.firstName!,
                lastName: data.lastName!,
                address: data.address!,
                city: data.city!,
                state: data.state!,
                pincode: data.pincode!,
                dob: data.dob!,
                aadhar: data.aadhar!,
                email: data.email,
                password: data.password
              }

            if(type === 'signup'){
                const newUser = await signUp(userData);

                setuser(newUser);
            }

            if(type === 'signin'){
                const response = await signIn({
                    email: data.email,
                    password: data.password
                });

                if(response){
                    router.push('/')
                }
            }

        } catch (error) {   
            console.log(error);
        } finally{
            setIsLaoding(false);
        }
    } 

  return (
    <section className='auth-form'>
        <header className='flex flex-col gap-5 md:gap-8'>
            <Link href={'/'} className='flex cursor-pointer items-center gap-1'>
                <Image src='/icons/logo.svg'
                width={34}
                height={34}
                alt='TrustWorth logo'
                />
                <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>TrustWorth</h1>
            </Link>
            <div className="flex flex-col gap-1 md:gap-3">
                <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
                    {user 
                        ? "Link Account"
                        : type === 'signin'
                            ? 'Sign In'
                            : 'Sing Up'
                    }
                    <p className="text-16 font-normal text-gray-600">
                        {user 
                            ?   'Link your account to get started'
                            :   'Please enter your credentials' 
                        }
                    </p>
                </h1>
            </div>
        </header>
        {user ? (
            <div className="flex flex-col gap-4">
                <PlaidLink user={user} variant='primary' />
            </div>
        )   :   ( 
            <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {type === 'signup' && (
                            <>
                                <div className='flex justify-between'>
                                    <CustomInput control={form.control} name='firstName' label='First Name' placeholder='Enter your first name' />
                                    <CustomInput control={form.control} name='lastName' label='Last Name' placeholder='Enter your last name' />
                                </div>
                                <CustomInput control={form.control} name='address' label='Address' placeholder='Enter your specific address' />
                                <CustomInput control={form.control} name='city' label='City' placeholder='Enter your city' />
                                <div className='flex justify-between'>
                                    <CustomInput control={form.control} name='state' label='State' placeholder='ex. DL' />
                                    <CustomInput control={form.control} name='pincode' label='Pin Code' placeholder='ex. 11001' />
                                </div>
                                <div className='flex justify-between'>
                                    <CustomInput control={form.control} name='dob' label='Date of Birth' placeholder='YYYY-MM-DD' />
                                    <CustomInput control={form.control} name='aadhar' label='Aadhar Number' placeholder='XXXX' />
                                </div>
                            </>
                        )}
                        
                        {/* <CustomInput control={form.control} name={'username'} label={'Username'} placeholder={"Enter your username"}/> */}
                        <CustomInput control={form.control} name={'email'} label={'Email'} placeholder={"Enter your email"}/>
                        <CustomInput control={form.control} name={'password'} label={'Password'} placeholder={'Enter your password'} />
                        
                        <div className='flex flex-col gap-4'>
                            <Button className='form-btn' type="submit" disabled={isLaoding}>
                                {isLaoding ? (
                                    <>
                                        <Loader2 size={20} className='animate-spin' /> &nbsp;
                                        Loading ...
                                    </>
                                ) :
                                    <>
                                        {type === 'signin' ? 'Sign In' : 'Sign Up'}
                                    </>
                                }
                            </Button>
                        </div>
                    </form>
                </Form>
                
                <footer className='flex justify-center gap-1'>
                    <p className='text-14 font-normal'>
                        {type === 'signin' ? 
                            "Don't have an account?"
                            :
                            "Already have an account?"
                        }
                    </p>
                    <Link href={type === 'signin' ? '/sign-up' : '/sign-in'} className='form-link'>
                        {type === 'signin' ? 'Sign Up' : 'Sign In'}
                    </Link>
                </footer>
            </>
        )} 
    </section>
  )
}

export default AuthForm
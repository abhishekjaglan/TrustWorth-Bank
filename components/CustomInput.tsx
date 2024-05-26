import React from 'react'
import { FormField, FormControl, FormMessage, FormLabel } from './ui/form'
import { Input } from "@/components/ui/input"
import { FieldPath, Form }from 'react-hook-form'

import z from 'zod'
import { Control } from 'react-hook-form'
import { authFormSchema } from '@/lib/utils'

const formSchema = authFormSchema('signup')

interface CustomInputType{
    control: Control<z.infer<typeof formSchema>>,
    placeholder: string,
    label: string,
    name: FieldPath<z.infer<typeof formSchema>>
}

const CustomInput = ({control, placeholder, label, name } : CustomInputType) => {
  return (
    <div>
        <FormField
            control={control}
            name={name}
            render={({ field }) => (
                <div className='form-item'>
                    <FormLabel    className='form-label'>
                        {label}
                    </FormLabel>
                    <div className='flex w-full flex-col'>
                        <FormControl>
                            <Input
                                placeholder={placeholder}
                                className='input-class'
                                type={name === 'password' ? 'password' : 'text'}
                                {...field}
                            />
                        </FormControl>
                        <FormMessage className='form-message mt-2'/>
                    </div>
                </div>
            )}
        />            
    </div>
  )
}

export default CustomInput
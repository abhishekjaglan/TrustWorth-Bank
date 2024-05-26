import AuthForm from '@/components/AuthForm'
import React from 'react'

const SignUp = async () => {

  return (
    <section className='flex-center size-full max-sm:px-6'>
      <AuthForm type='signup'/>
    </section>
  )
}

export default SignUp
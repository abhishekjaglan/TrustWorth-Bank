import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar'
import TotalBalance from '@/components/TotalBalance'
import React from 'react'

const Home = () => {
    const loggedIn = {
        firstName: "Abhishek",
        lastName: "Jaglan",
        email: "jaglanabhishek08@gmail.com"
    }
  return (
    <section className='home'>
        <div className='home-content'>
            <header className='home-header'>
                <HeaderBox
                    type="greeting"
                    title="Welcome"
                    user={loggedIn?.firstName || "Guest"}
                    subtext = "Access and manage your account and transactions efficiently"
                />

                <TotalBalance
                    accounts={[]}
                    totalBanks={1}
                    totalCurrentBalance={1250.35}
                />
            </header>

            RECENT TRANSACTION
        </div>

        <RightSidebar 
            user={loggedIn}
            transactions={[]}
            banks={[{currentBalance: 123.50}, {currentBalance: 500.75}]}
        />
    </section>
  )
}

export default Home
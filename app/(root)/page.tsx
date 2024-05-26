import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar'
import TotalBalance from '@/components/TotalBalance'
import { getLoggedInUser } from '@/lib/actions/user.actions'
import React from 'react'

const Home = async () => {
    const loggedIn = await getLoggedInUser();
    console.log("LoggedINUser:      ",loggedIn);

  return (
    <section className='home'>
        <div className='home-content'>
            <header className='home-header'>
                <HeaderBox
                    type="greeting"
                    title="Welcome"
                    user={loggedIn?.name || "Guest"}
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
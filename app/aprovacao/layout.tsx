import React from 'react'

export default function AprovacaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" 
        rel="stylesheet" 
      />
      <link 
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" 
        rel="stylesheet" 
      />
      <div className="min-h-screen bg-transparent">
        {children}
      </div>
    </>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { EditorialHeader } from "@/components/brand/EditorialHeader";
import { PostOfDayCard } from "@/components/brand/PostOfDayCard";
import { ClientIdentityCard } from "@/components/brand/ClientIdentityCard";
import { getClients, getPosts } from "./actions";

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const [clients, allPosts] = await Promise.all([
    getClients(),
    getPosts()
  ]);

  // Encontrar o post mais recente (Post do Dia)
  const postOfDay = allPosts[0];

  return (
    <div className="space-y-16 animate-in fade-in-50 duration-500">
      <EditorialHeader 
        title="Mesa de Trabalho" 
        subtitle={`Sua visão geral de pautas, aprovações e cronograma da semana. Olá, ${user.email?.split('@')[0]}.`}
      />

      {postOfDay && (
        <section>
          <h3 className="font-sans font-semibold text-text-primary uppercase tracking-widest text-xs mb-6">Em Destaque (Post do Dia)</h3>
          <PostOfDayCard 
            title={postOfDay.title}
            client={postOfDay.clients?.name || 'Cliente'}
            channel="Peça"
            format="Social Media"
            status={postOfDay.status}
            cta={{ label: "Abrir Pauta", onClick: () => {} }} // OnClick doesn't work in Server Components directly, but we don't have a handler yet
          />
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => {
          const clientPosts = allPosts.filter(p => p.client_id === client.id);
          const pendingPosts = clientPosts.filter(p => p.status !== 'approved').length;
          
          return (
            <ClientIdentityCard 
              key={client.id}
              name={client.name}
              currentMonth={new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              totalPosts={clientPosts.length}
              pendingPosts={pendingPosts}
              manager="Agência Duas Mãos"
            />
          );
        })}
      </section>
    </div>
  )
}

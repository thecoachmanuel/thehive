"use client"
import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import ProductCard from './ProductCard'

type Category = { id: number; name: string; slug: string; items: Array<{ id: number; name: string; description: string; priceNgn: number; imageUrl: string }> }

export default function ShopGrid({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams()
  const initialCategory = searchParams?.get('category') ?? null
  const [selected, setSelected] = useState<string>(
    initialCategory && categories.some(c => c.slug === initialCategory) ? initialCategory : 'all'
  )

  useEffect(() => {
    const cat = searchParams?.get('category') ?? null
    if (cat && categories.some(c => c.slug === cat)) {
      setSelected(cat)
    } else {
      setSelected('all')
    }
  }, [searchParams, categories])

  const allProducts = useMemo(() => categories.flatMap((c) => c.items), [categories])
  const products = selected === 'all' ? allProducts : (categories.find((c) => c.slug === selected)?.items ?? [])
  const selectedName = selected === 'all' ? 'All' : categories.find((c) => c.slug === selected)?.name ?? 'All'
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
      <aside className="md:col-span-1">
        <div className="md:sticky md:top-24 bg-cream/50 md:bg-transparent p-4 rounded-xl">
          <h3 className="font-bold text-cocoa">Categories</h3>
          <div className="mt-3 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <button className={`btn whitespace-nowrap ${selected === 'all' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelected('all')}>All</button>
            {categories.map((c) => (
              <button key={c.id} className={`btn whitespace-nowrap ${selected === c.slug ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelected(c.slug)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </aside>
      <section className="md:col-span-3">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-cocoa">{selectedName}</h2>
          <span className="text-sm text-cocoa/70">{products.length} items</span>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} categoryName={selected === 'all' ? undefined : selectedName} />
          ))}
        </div>
      </section>
    </div>
  )
}

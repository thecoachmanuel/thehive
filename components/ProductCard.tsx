"use client"
import Image from 'next/image'
import { formatNgn } from '@lib/utils'
import { useState } from 'react'
import { useCart } from '@components/CartProvider'

export default function ProductCard({
  product,
  onAdd,
  categoryName
}: {
  product: { id: number; name: string; description: string; priceNgn: number; imageUrl: string }
  onAdd?: (id: number) => void
  categoryName?: string
}) {
  const [error, setError] = useState(false)
  const src = error
    ? 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg'
    : product.imageUrl
  return (
    <div className="card overflow-hidden group">
      <div className="relative h-56 md:h-64">
        <Image
          src={src}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          onError={() => setError(true)}
        />
        {categoryName && (
          <span className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur text-cocoa text-xs md:text-sm px-3 py-1 rounded-full border border-cream">
            {categoryName}
          </span>
        )}
        <span className="absolute top-3 right-3 z-10 bg-caramel text-white text-xs md:text-sm px-3 py-1 rounded-full">
          {formatNgn(product.priceNgn)}
        </span>
        <div className="absolute inset-x-0 bottom-0 z-0 bg-gradient-to-t from-black/50 to-transparent p-3 text-white pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm md:text-base truncate max-w-[85%]">{product.name}</span>
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-sm md:text-base text-cocoa/70 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-1 text-caramel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.897l-7.336 4.168 1.402-8.167L.132 9.211l8.2-1.193z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.897l-7.336 4.168 1.402-8.167L.132 9.211l8.2-1.193z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.897l-7.336 4.168 1.402-8.167L.132 9.211l8.2-1.193z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.897l-7.336 4.168 1.402-8.167L.132 9.211l8.2-1.193z"/></svg>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .587l3.668 7.431 8.2 1.193-5.934 5.787 1.402 8.167L12 18.897l-7.336 4.168 1.402-8.167L.132 9.211l8.2-1.193z"/></svg>
          <span className="ml-2 text-xs text-cocoa/60">Popular</span>
        </div>
        <div className="pt-1">
          {onAdd ? (
            <button className="btn btn-primary w-full" onClick={() => onAdd(product.id)}>Add to Cart</button>
          ) : (
            <AddToCartButton product={product} />
          )}
        </div>
      </div>
    </div>
  )
}

function AddToCartButton({ product }: { product: { id: number; name: string; priceNgn: number; imageUrl: string } }) {
  const { add } = useCart()
  return (
    <button
      className="btn btn-primary w-full"
      onClick={() => add({ productId: product.id, name: product.name, priceNgn: product.priceNgn, imageUrl: product.imageUrl }, 1)}
    >
      Add to Cart
    </button>
  )
}

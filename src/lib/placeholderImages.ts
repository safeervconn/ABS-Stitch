export const PLACEHOLDER_IMAGES = {
  product: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZSBBdmFpbGFibGU8L3RleHQ+PC9zdmc+',
  order: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2VmZjZmZiIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIwMCwgMjAwKSI+PHBhdGggZD0iTSAwIC02MCBMIDUyIC0xOCBMIDMyIDQ4IEwgLTMyIDQ4IEwgLTUyIC0xOCBaIiBmaWxsPSIjYmRlMGZlIiBzdHJva2U9IiM2MGExZjciIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48dGV4dCB4PSI1MCUiIHk9IjcwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjBhMWY3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5ObyBEZXNpZ248L3RleHQ+PC9zdmc+',
  thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=',
};

export function getPlaceholderImage(type: 'product' | 'order' | 'thumbnail' = 'product'): string {
  return PLACEHOLDER_IMAGES[type];
}

export function getImageSrc(imageUrl: string | null | undefined, type: 'product' | 'order' | 'thumbnail' = 'product'): string {
  if (!imageUrl || imageUrl.trim() === '') {
    return getPlaceholderImage(type);
  }
  return imageUrl;
}

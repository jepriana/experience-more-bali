import React from 'react';

/** Neutral placeholder while the browser checks whether you are signed up (avoids a form flash). */
export function PageLoading() {
  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto" aria-busy="true">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-2xl p-8 space-y-5">
          <div className="shimmer h-6 w-40 rounded-full" />
          <div className="shimmer h-8 w-3/4 rounded-lg" />
          <div className="shimmer h-11 w-full rounded-xl" />
          <div className="shimmer h-11 w-full rounded-xl" />
          <div className="shimmer h-11 w-2/3 rounded-xl" />
        </div>
        <div className="lg:col-span-5 flex justify-center">
          <div className="shimmer w-72 h-72 rounded-[3rem]" />
        </div>
      </div>
    </div>
  );
}

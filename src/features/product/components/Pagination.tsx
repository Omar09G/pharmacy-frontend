import React from 'react';

type Props = {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
};

const Pagination: React.FC<Props> = ({ page, total, limit, onPage }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex items-center gap-2 mt-4">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-1 px-4 rounded-full"
      >
        Prev
      </button>
      <div className="px-3 py-1 font-black">
        {page} / {totalPages}
      </div>
      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-1 px-4 rounded-full"
      >
        Next
      </button>
      <div className="bg-fuchsia-100 hover:bg-fuchsia-200 text-white rounded-full">
        <div className="relative">
          <select
            className="w-full bg-transparent placeholder:text-fuchsia-400 text-fuchsia-700 text-sm  
          border-fuchsia-200  pl-3 pr-8 py-2 transition duration-300 ease focus:outline-none  
          hover:border-fuchsia-400 focus:shadow-md appearance-none cursor-pointer"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

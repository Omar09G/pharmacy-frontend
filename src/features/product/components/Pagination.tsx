import React, { useEffect, useState } from 'react';

type Props = {
  page: number;
  total: number;
  limit: number;
  onPage: (p: number) => void;
  changeLimit: (p: number) => void;
};

const Pagination: React.FC<Props> = ({
  page,
  total,
  limit,
  onPage,
  changeLimit,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [selectedValue, setSelectedValue] = useState<string>(String(limit));
  const [isActivPage, setIsActivPage] = useState<boolean>(false);
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValue(e.target.value);
    changeLimit(Number(e.target.value));
  };

  useEffect(() => {
    // keep the select in sync if parent `limit` changes
    setSelectedValue(String(limit));
  }, [limit]);

  useEffect(() => {
    if (page != 0) {
      setIsActivPage(true);
    } else {
      setIsActivPage(false);
    }
  }, [page]);

  return (
    <div className="flex items-center gap-2 mt-4 flex-wrap">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className={
          isActivPage
            ? 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-1 px-4 rounded-full shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-60 disabled:cursor-not-allowed'
            : 'bg-fuchsia-500 text-white font-bold py-1 px-4 rounded-full shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-60 disabled:cursor-not-allowed'
        }
        aria-label="Página anterior"
        aria-disabled={page <= 1}
      >
        <svg
          className="inline-block w-4 h-4 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12.293 16.293a1 1 0 010-1.414L15.586 11H5a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Prev
      </button>
      <div className="px-3 py-1 font-black">
        {page} / {totalPages}
      </div>

      <button
        disabled={page >= totalPages}
        onClick={() => onPage(page + 1)}
        className={
          isActivPage
            ? 'bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-bold py-1 px-4 rounded-full shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-60 disabled:cursor-not-allowed'
            : 'bg-fuchsia-500 text-white font-bold py-1 px-4 rounded-full shadow-sm transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-fuchsia-300 disabled:opacity-60 disabled:cursor-not-allowed'
        }
        aria-label="Página siguiente"
        aria-disabled={page >= totalPages}
      >
        Next
        <svg
          className="inline-block w-4 h-4 ml-2"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M7.707 3.707a1 1 0 010 1.414L4.414 9H15a1 1 0 110 2H4.414l3.293 3.293a1 1 0 01-1.414 1.414l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="bg-fuchsia-100 hover:bg-fuchsia-200 rounded-md">
        <div className="relative text-center">
          <select
            aria-label="Cambiar límite de resultados por página"
            className="w-28 bg-transparent placeholder:text-fuchsia-400 text-fuchsia-700 text-sm  
          border-fuchsia-200  pl-3 pr-2 py-2 transition duration-150 ease focus:outline-none  
          hover:border-fuchsia-400 focus:shadow-sm appearance-none cursor-pointer text-center"
            value={selectedValue}
            onChange={handleChange}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

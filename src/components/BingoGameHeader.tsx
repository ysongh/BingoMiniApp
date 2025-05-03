import { useNavigate } from 'react-router-dom';

function BingoGameHeader({ name }: string) {
  const navigate = useNavigate();

  return (
    <header className="bg-indigo-500 py-2 px-4 text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() =>  navigate('/')}
            className="mr-3 text-white hover:bg-indigo-700 p-1 rounded flex items-center"
            title="Back to Lobby"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-lg font-bold">Room: {name}</h1>
        </div>
      </div>
    </header>
  )
}

export default BingoGameHeader;
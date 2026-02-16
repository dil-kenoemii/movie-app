import { MovieCard } from "@/common";
import { useWatchlist } from "@/context/watchlistContext";
import { smallMaxWidth } from "@/styles";
import { mainHeading } from "@/styles";
import { cn } from "@/utils/helper";

const Watchlist = () => {
  const { watchlist } = useWatchlist();

  return (
    <section className={`${smallMaxWidth} pt-28 pb-8`}>
      <h2
        className={cn(
          mainHeading,
          "dark:text-gray-50 text-[#333] mb-8"
        )}
      >
        My Watchlist
      </h2>

      {watchlist.length === 0 ? (
        <p className="dark:text-gray-400 text-gray-500 text-center text-lg py-16">
          Your watchlist is empty. Browse movies and series to add some!
        </p>
      ) : (
        <div className="flex flex-wrap xs:gap-4 gap-[14px] justify-center">
          {watchlist.map((item) => (
            <div
              key={item.id}
              className="flex flex-col xs:gap-4 gap-2 xs:max-w-[170px] max-w-[124px] rounded-lg lg:mb-6 md:mb-5 sm:mb-4 mb-[10px]"
            >
              <MovieCard movie={item} category={item.category} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default Watchlist;

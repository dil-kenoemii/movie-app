import React, { useContext, useState, useEffect, useCallback } from "react";
import { saveWatchlist, getWatchlist } from "@/utils/helper";
import { IWatchlistItem } from "@/types";

interface WatchlistContextValue {
  watchlist: IWatchlistItem[];
  addToWatchlist: (item: IWatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  isInWatchlist: (id: string) => boolean;
}

const context = React.createContext<WatchlistContextValue>({
  watchlist: [],
  addToWatchlist: () => {},
  removeFromWatchlist: () => {},
  isInWatchlist: () => false,
});

interface Props {
  children: React.ReactNode;
}

const initialWatchlist = getWatchlist();

const WatchlistProvider = ({ children }: Props) => {
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>(initialWatchlist);

  useEffect(() => {
    saveWatchlist(watchlist);
  }, [watchlist]);

  const addToWatchlist = useCallback((item: IWatchlistItem) => {
    setWatchlist((prev) => {
      if (prev.some((w) => String(w.id) === String(item.id))) return prev;
      return [...prev, item];
    });
  }, []);

  const removeFromWatchlist = useCallback((id: string) => {
    setWatchlist((prev) => prev.filter((w) => String(w.id) !== id));
  }, []);

  const isInWatchlist = useCallback(
    (id: string) => watchlist.some((w) => String(w.id) === id),
    [watchlist]
  );

  return (
    <context.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </context.Provider>
  );
};

export default WatchlistProvider;

export const useWatchlist = () => {
  return useContext(context);
};

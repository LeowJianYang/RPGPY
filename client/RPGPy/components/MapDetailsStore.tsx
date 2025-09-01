import {create} from 'zustand';
import {persist} from 'zustand/middleware';

type MapDetailsType ={
    MapId:string, 
    MapName:string, 
    MapDetails:string
}[];

type MapDetailsStoreType ={
    MapDetails: MapDetailsType ;
    setMapDetails: (MapDetails: MapDetailsType) => void;
}

export const useMapDetailsStore = create<MapDetailsStoreType>()(
  persist(
    (set) => ({
      MapDetails: [],
      setMapDetails: (data) => set({ MapDetails: data }),
    }),
    {
      name: "map-details-store", // Ensure the data is in local cache
    }
  )
);


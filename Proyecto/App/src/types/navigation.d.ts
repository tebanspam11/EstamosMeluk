import { Pet } from './pet';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      Login: undefined;
      Home: undefined;
      Profile: undefined;
      Calendar: undefined;
      Carnet: undefined;
      ClinicHistory: undefined;
      Upload: undefined;
      VeterinarySearch: undefined;
      PetProfile: { pet: Pet };
      EditPetProfile: { pet: Pet | null };
    }
  }
}

export {};

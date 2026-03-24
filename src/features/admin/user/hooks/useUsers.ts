import { useUserStore } from '../store/UserContext';

export const useUsers = () => {
  return useUserStore();
};

export default useUsers;

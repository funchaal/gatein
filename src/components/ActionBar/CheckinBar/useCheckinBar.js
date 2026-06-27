import { useNavigation } from '@react-navigation/native';
import { useActiveTerminal } from './useActiveTerminal';

export const useCheckinBar = () => {
  const navigation = useNavigation();
  const activeTerminal = useActiveTerminal();

  const handleCheckin = () => {
    if (!activeTerminal) return;
    
    navigation.navigate('CheckinProcessing', { terminal_id: activeTerminal.id });
  };

  return {
    activeTerminal,
    handleCheckin,
  };
};

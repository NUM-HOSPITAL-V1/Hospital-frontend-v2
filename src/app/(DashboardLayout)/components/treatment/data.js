export const mockTreatments = [];
  
  // Helper functions
  export const getStatusColor = (status) => {
    switch (status) {
      case 'Хүлээгдэж буй':
        return 'warning';
      case 'Хийгдэж буй':
        return 'info';
      case 'Дууссан':
        return 'success';
      default:
        return 'default';
    }
  };
  
  export const getStatusIcon = (status) => {
    switch (status) {
      case 'Хүлээгдэж буй':
        return 'PendingIcon';
      case 'Хийгдэж буй':
        return 'ScheduleIcon';
      case 'Дууссан':
        return 'CheckCircleIcon';
      default:
        return null;
    }
  };
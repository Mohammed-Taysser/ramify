import { App } from 'antd';
import axios from 'axios';

function prepareErrorMessage(err: unknown): string | string[] {
  const error = err as APIResponseError;

  // If error is undefined or null, return a generic message or null
  if (!error) {
    return 'Error has occurred';
  }

  // Check if the error is an Axios error
  if (axios.isAxiosError(error)) {
    if (error.message === 'Network Error') {
      return 'Please check your internet connection and try again';
    }

    if (error.message === 'Request aborted') {
      return 'Request was aborted';
    }
 
    if (error.response?.data?.error) {
      return error.response.data.error;
    }

    if (error.response?.data.errors) {
      return Object.values(error.response.data.errors);
    }
  }

  if (error.message) {
    return error.message;
  }

  return 'Error has occurred';
}

function useApiMessage() {
  const { message } = App.useApp();

  function displayErrorMessages(error: unknown) {
    const enhancedError = prepareErrorMessage(error);

    if (typeof enhancedError === 'string') {
      message.error(enhancedError);
    } else if (Array.isArray(enhancedError)) {
      enhancedError.forEach((err) => {
        message.error(err);
      });
    }
  }

  function handleSettledAPIResult<T>(
    result: PromiseSettledResult<T>,
    onSuccess: (value: T) => void
  ) {
    if (result.status === 'fulfilled') {
      onSuccess(result.value);
    } else {
      displayErrorMessages(result.reason);
    }
  }

  return {
    displayErrorMessages,
    prepareErrorMessage,
    handleSettledAPIResult,
  };
}

export default useApiMessage;

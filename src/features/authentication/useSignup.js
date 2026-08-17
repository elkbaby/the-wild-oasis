import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup as signupApi } from "../../services/apiAuth";
import { toast } from "react-hot-toast";

export function useSignup() {
  const queryClient = useQueryClient();
  const { mutate: signup, isLoading } = useMutation({
    mutationFn: signupApi,
    onSuccess: () => {
      toast.success(
        "Account successfully created. The user may need to verify their email.",
      );
      queryClient.invalidateQueries({ queryKey: ["hotel-members"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return { signup, isLoading };
}

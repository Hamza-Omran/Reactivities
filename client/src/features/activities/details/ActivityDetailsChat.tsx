import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Avatar,
  CircularProgress,
} from "@mui/material";
import { Link, useParams } from "react-router";
import { useComments } from "../../../lib/hooks/useComments";
import { timeAgo } from "../../../lib/util/util";
import { useForm, type FieldValues } from "react-hook-form";
import type { KeyboardEvent } from "react";
import { observer } from "mobx-react-lite";

// now inorder for the observer to work we need to wrap the whole function inside it and it is working without it but for the flags for example it won't
// and we do it this way since it won't show a warning in the terminal
const ActivityDetailsChat = observer(function ActivityDetailsChat() {
  const { id } = useParams();
  const { commentStore } = useComments(id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm();

  //    we will just use field values for this as using zod here and configuring it for just a single property will be excessive
  const addComment = async (data: FieldValues) => {
    try {
      await commentStore.hubConnection?.invoke("SendComment", {
        activityId: id,
        body: data.body,
      });
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(addComment)(); // without that second parenthesis it won't execute as the first is for parameter
    }
  };

  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          bgcolor: "primary.main",
          color: "white",
          padding: 2,
        }}
      >
        <Typography variant="h6">Chat about this event</Typography>
      </Box>
      <Card>
        <CardContent>
          <div>
            <form>
              <TextField
                {...register("body", { required: true })}
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                sx={{
                  "& textarea": {
                    minHeight: "50px",
                  },
                }}
                placeholder="Enter your comment (Enter to submit, SHIFT + Enter for new line)"
                onKeyDown={handleKeyPress}
                slotProps={{
                  input: {
                    endAdornment: isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : null,
                  },
                }}
              />
            </form>
          </div>

          <Box sx={{ height: 400, overflow: "auto" }}>
            {commentStore.comments.map((comment) => (
              <Box key={comment.id} sx={{ display: "flex", my: 2 }}>
                <Avatar
                  src={comment.imageUrl || "/images/user.png"}
                  alt={"user image"}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <Typography
                      component={Link}
                      to={`/profile/${comment.userId}`}
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", textDecoration: "none" }}
                    >
                      {comment.displayName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {timeAgo(comment.createdAt)}
                    </Typography>
                  </Box>

                  <Typography sx={{ whiteSpace: "pre-wrap" }}>
                    {comment.body}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>
    </>
  );
});

export default ActivityDetailsChat;

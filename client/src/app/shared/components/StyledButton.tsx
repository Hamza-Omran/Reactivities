import { Button, styled, type ButtonProps } from "@mui/material";
import type { LinkProps } from "react-router";

type StyledButtonProps = ButtonProps & Partial<LinkProps>

const StyledButton = styled(Button)<StyledButtonProps>(({theme}) => ({
    // we are basically override the default style in mui
    // we have created this button so the normal mui button do disappear when it is on image and we update it using the react query and we will use it everywhere we got disabled property
    '&.Mui-disabled': {
        backgroundColor: theme.palette.grey[600],
        color: theme.palette.text.disabled
    }
}))

export default StyledButton;
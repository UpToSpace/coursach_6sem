const colors = [
    { name: "red", hex: "#ff0000" },
]

export const reactSelectStyles = {
    option: (defaultStyles, state) => ({
        ...defaultStyles,
        // color: state.isSelected ? "#212529" : "#fff",
        // backgroundColor: state.isSelected ? "#a0a0a0" : "#212529",
        "&:hover": {
            cursor: "pointer",
        },
    }),

    control: (defaultStyles) => ({
        ...defaultStyles,
        '&:hover': {
            cursor: "pointer",
        },
        // backgroundColor: "#212529",
        // border: "none",
        // boxShadow: "none",
    }),
    singleValue: (defaultStyles) => ({ ...defaultStyles, zIndex: "1000"}),
    menuPortal: base => ({ ...base, zIndex: 9999 })
};

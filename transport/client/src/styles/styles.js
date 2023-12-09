const colors = [
    { name: "red", hex: "#ff0000" },
]

export const reactSelectStyles = {
    option: (defaultStyles, state) => ({
        ...defaultStyles,
        color: state.isSelected ? "#212529" : "#fff",
        backgroundColor: state.isSelected ? "#a0a0a0" : "#212529",
        "&:hover": {
            color: "#212529",
            backgroundColor: "#a0a0a0",
        },
    }),

    control: (defaultStyles) => ({
        ...defaultStyles,
        backgroundColor: "#212529",
        border: "none",
        boxShadow: "none",
    }),
    singleValue: (defaultStyles) => ({ ...defaultStyles, color: "#fff" }),
    menuPortal: base => ({ ...base, zIndex: 9999 })
};

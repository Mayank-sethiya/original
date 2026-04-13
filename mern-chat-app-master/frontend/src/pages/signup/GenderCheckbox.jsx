const GenderCheckbox = ({ onCheckboxChange, selectedGender }) => {
    return (
        <div className='flex gap-4'>
            <div className='form-control'>
                {/* Added a subtle opacity transition so unselected items fade slightly to the background */}
                <label className={`label gap-2 cursor-pointer transition-all duration-200 ${selectedGender === "male" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
                    <span className='text-sm font-medium text-gray-300'>Male</span>
                    <input
                        type='checkbox'
                        // Styled to match the blue theme when checked
                        className='checkbox checkbox-sm border-gray-500 checked:border-blue-500 checked:bg-blue-500 transition-all'
                        checked={selectedGender === "male"}
                        onChange={() => onCheckboxChange("male")}
                    />
                </label>
            </div>
            
            <div className='form-control'>
                <label className={`label gap-2 cursor-pointer transition-all duration-200 ${selectedGender === "female" ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
                    <span className='text-sm font-medium text-gray-300'>Female</span>
                    <input
                        type='checkbox'
                        className='checkbox checkbox-sm border-gray-500 checked:border-blue-500 checked:bg-blue-500 transition-all'
                        checked={selectedGender === "female"}
                        onChange={() => onCheckboxChange("female")}
                    />
                </label>
            </div>
        </div>
    );
};

export default GenderCheckbox;
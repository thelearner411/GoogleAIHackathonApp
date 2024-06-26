"use client"
import { RefObject, useContext, useEffect, useRef, useState } from "react"
import { ThemeContext } from "@/app/components/Layouts/MainLayout"
import { ContentDropdownProps, UserFormProps, UserFormType } from "@/app/types/Forms"
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { literatureContentTypes, artContentTypes, artOrientations } from "@/app/constants/DropdownConstants"

export default function ContentTypeDropdown({ userPrompt, setUserPrompt, 
    contentCategory, contentLookupData }: UserFormType) {

    const { lightTheme, setLightTheme }: any = useContext(ThemeContext);
    const [openDropdown, setOpenDropdown] = useState<boolean>(false);
    const dropdownRef: RefObject<HTMLDivElement> | null = useRef(null);
    const [dropdownData, setDropdownData] = useState<any[]>(contentLookupData.literature_content_types);
    const [selectedDropdownDisplayValue, setSelectedDropdownDisplayValue] = useState<any>(contentLookupData.literature_content_types[0].value);

    useEffect(() => {
        window.addEventListener('click', toggleDropdown);
        return () => {
            window.removeEventListener('click', toggleDropdown);
        };
    }, []);

    const toggleDropdown = (event: any): void => {
        const dropdownRefElement = dropdownRef?.current;
        if (dropdownRefElement && !dropdownRefElement.contains(event.target)) {
            event.stopPropagation();
            setOpenDropdown((prevValue) => false);
        };
    };

    useEffect(() => {
        // Reset dropdown values and user prompt content_type values upon toggle between literature and art 
        if (contentCategory === 1) {
            setSelectedDropdownDisplayValue(contentLookupData.literature_content_types[0].value);
            setUserPrompt({...userPrompt, content_type: contentLookupData.literature_content_types[0].key});
            setDropdownData(contentLookupData.literature_content_types);
        } else {
            setSelectedDropdownDisplayValue(contentLookupData.art_styles[0].value);
            setUserPrompt({...userPrompt, content_type: contentLookupData.art_styles[0].key})
            setDropdownData(contentLookupData.art_styles);
        }
    }, [contentCategory]);

    return (
        <>
            <div className={"w-fit relative"} ref={dropdownRef}>
                {/* Dropdown Header */}
                <div className={`border border-green-standard rounded p-2 min-w-[119.37px] cursor-pointer`}
                    onClick={(event) => {
                        event.stopPropagation();
                        setOpenDropdown(!openDropdown);
                    }}>
                    <div>
                        <div className={"flex items-center justify-center gap-2"}>
                            <div className={`${lightTheme ? ("text-green-dark") : ("text-white")}`}>
                                {selectedDropdownDisplayValue}
                            </div>
                            <div className={"text-green-text"}>
                                {openDropdown ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                        </div>
                    </div>
                </div>

                {openDropdown ? (
                    <>
                        {/* Dropdown Options */}
                        <div className={`absolute ${lightTheme ? ("bg-white") : ("bg-green-dark")} border border-green-standard rounded mt-2`}>
                            {dropdownData.map((dropdownDataEntry: any, index: number) => {
                                return (
                                    <>
                                        <div
                                            key={`dropdown-option-${index + 1}`}
                                            className={`${userPrompt.content_type === dropdownDataEntry.key ? (`bg-green-standard`) : (lightTheme ? ("text-green-dark") : ("text-white"))}
                                     hover:bg-green-standard hover:text-green-dark w-full py-2 px-10 w-full cursor-pointer`}
                                            onClick={() => {
                                                setSelectedDropdownDisplayValue(dropdownDataEntry.value);
                                                setUserPrompt({ ...userPrompt, content_type: dropdownDataEntry.key });
                                                setOpenDropdown(false);
                                            }}>
                                            {dropdownDataEntry.value}
                                        </div>
                                    </>
                                )
                            })}
                        </div>
                    </>
                ) : ("")}
            </div>
        </>
    );
}

import { useState } from "react";
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx'; 
import { twMerge } from 'tailwind-merge';
import { Button } from '../components/Button.tsx';

import { colors, colorVariants } from '../styles/color.ts';
import { typographyVariants } from '../styles/typography.ts';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const closeSidebar = () => setIsOpen(false);
  const navigate = useNavigate();
// 2) 체크박스에서 선택된 아이템의 id들을 별도로 저장
const [selectedIds, setSelectedIds] = useState([]);
const [isSelected,setisSelected]=useState(false);

// 모달 열림/닫힘 상태
const [showModal, setShowModal] = useState(false);
const [showModalLogOut, setShowModalLogOut]= useState(false);

//나중에 백엔드 ver2 붙이고 서버에서 불러오기기
const [items, setItems] = useState([
  { id: 1, title: "9월 동아리 정기회의", daysLeft: 7 },
  { id: 2, title: "프로젝트 2차 회의", daysLeft: 4 },
  { id: 3, title: "영어 스터디", daysLeft: 1 },
]);
  const [isChecked, setIsChecked] = useState(false);
  const [isVisuallyChecked, setIsVisuallyChecked] = useState(false);
  // 체크박스(선택) 모드 활성화 여부: 하나의 항목 클릭 시 true로 변경
  const [isSelectionMode, setIsSelectionMode] = useState(false);
// 전체(또는 제목) 클릭 시, selectedIds 토글
const handleToggleSelect = (id) => {
  if (!isSelectionMode) setIsSelectionMode(true);
  if (selectedIds.includes(id)) {
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  } else {
    setSelectedIds([...selectedIds, id]);
   }
 };

// 3) 리스트 아이템을 클릭(혹은 체크박스 클릭)할 때, 해당 id를 추가/제거
const handleItemClick = (id) => {
  if (selectedIds.includes(id)) {
    setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
  } else {
    setSelectedIds([...selectedIds, id]);
  }
};

// 삭제하기 버튼을 누르면 모달 띄움
const handleDeleteButtonClick = () => {
  setShowModal(true);
};
// 로그아웃 버튼 누르면 모달 띄움
const handleLogOutButtonClick = () => {
  setShowModalLogOut(true);
}
const handleLogOut = () => {
  setShowModalLogOut(false);
}

// 모달에서 '삭제' 버튼 클릭 → 선택된 아이템들을 삭제 처리
const handleConfirmDelete = () => {
  setItems(items.filter((item) => !selectedIds.includes(item.id)));
  setSelectedIds([]);  // 선택 상태 초기화
  setShowModal(false);
  setIsSelectionMode(false); // 선택 모드 해제
};

// 모달에서 '취소' 버튼 클릭
const handleCancelDelete = () => {
  setShowModal(false);
};


  return isOpen ? (
    <>
      <Helmet>
        <title>언제볼까?</title>
        <meta
          name="description"
          content="언제볼까?와 함께 약속방을 링크 공유로 초대하세요. 공유만 하면 끝, 간편한 친구 초대!"
        />
      </Helmet>

      <div className="flex  w-full justify-between  items  bg-[var(--white)] flex-col ">
      <div className="justify-end flex p-[0.8rem] pb-0 pt-[1.2rem]">
        <button onClick={closeSidebar} className={`items-end p-[1.2rem]`}>
          <img src="icon_X_noBg.svg" alt="달력 페이지로 돌아가기"          
              onClick={() => navigate('/MonthView')} 
          />
        </button>
      </div>
      <div className='flex flex-col px-[2.4rem]  '>

    <div className="  h-full w-auto pt-0">
      {/* 닫기 버튼 */}
      {/* 제목 */}
      <h1 className={`             
        ${colorVariants({ color: 'gray-900' })} 
        ${typographyVariants({ variant: 'h1-sb' })}
        !text-[var(--font-size-20)]
        text-[2rem]
        mb-[1.2rem]
         `}>
          모든 공유 캘린더
      </h1>
      {/* 공유 캘린더 리스트 */}
      <ul className="mb-[4.8rem] ">
      {items.map((item) => (
          <li key={item.id} className="flex justify-between items-center  pb-[0.8rem] pt-[1.2rem] border-b border-[var(--gray-100)] ">
            {/* 왼쪽 체크박스 + 타이틀 */}
            <div className="flex items-center cursor-pointer">
            {isSelectionMode && (
                  // <input
                  //   type="checkbox"
                  //   checked={isSelected}
                  //   className="w-4 h-4 mr-2 border-[var(--gray-50)]"
                  // />
                  <div className=" flex flex-col !items-end !justify-end  ">
                  <input 
                    type="checkbox" 
                    id={`Keep-logged-in-${item.id}`}
                    className="invite-screen-reader" 
                    checked={ selectedIds.includes(item.id) }
                    onChange={(e) => {
                      setIsChecked(e.target.checked);
                      setIsVisuallyChecked(e.target.checked); 
                      e.stopPropagation();
                      // handleToggleSelect(item.id);
                      handleToggleSelect(item.id)

                    }}   
                  />
                  <div className="invite-label-box">
                    <label 
                      htmlFor={`Keep-logged-in-${item.id}`}
                      className={`${typographyVariants({ variant: 'b2-md' })} 
                      !text-[1.4rem]
                      ${(isVisuallyChecked || isChecked) ? colorVariants({ color: 'gray-900' }) : colorVariants({ color: 'gray-700' })}`}
                    >  
                      <span className="invite-check-icon" aria-hidden="true"></span>
                    </label>
                  </div>
                </div>
                )}

             
              <span
                className={`
                  ml-2
                  ${typographyVariants({ variant: 'b2-md' })}
                  !text-[1.4rem]
                  ${colorVariants({ color: 'gray-800' })}
                  hover:bg-var[(--red-30)]
                  cusror-pointer
                `}
                onClick={() => handleToggleSelect(item.id)}

              >
                {item.title}
              </span>
            </div>
            <div className={` ${typographyVariants({ variant: 'd3-rg' })} ${colorVariants({ color: 'gray-600' })}
                             !text-[1.2rem] `}>
              <span className={` ${colorVariants({ color: 'red-300' })} `}>{item.daysLeft}</span>
                  일 후 삭제
              </div>
          </li>
        ))}
         {isSelectionMode && selectedIds.length > 0   && (
        <>
        <div className={`flex flex-row mt-[2rem] ${typographyVariants({ variant: 'b2-md' })} gap-[0.8rem] text-[1.4rem]`}>
        <Button label='취소하기'
                size={'S'} 
                // onClick={onCreateCalendar} 
                additionalClass={`
                  ${colorVariants({ color: 'gray-800' })}
                  border-[var(--gray-500)]
                `}
                // onClick={()=>  setShowModal(false)}
                onClick={() => {setSelectedIds([]); setIsSelectionMode(false);} } // 취소: 선택 해제
        />
        <Button
          label="삭제하기"
          size="S"
          additionalClass={`
            ${colorVariants({ color: 'red-300' })}
            border-[var(--red-300)]
            bg-[var(--red-50)]
          `}
          onClick={handleDeleteButtonClick}
        />
        </div>
      </>
      )}
      </ul>
      {/* 모달 */}
      {showModal && (
        <div className=
        {` fixed inset-0 flex items-center justify-center z-50 bg-black/25
           ${typographyVariants({ variant: "h2-sb" })}, 
          ${colorVariants({ color: "gray-800" })}, 
          p-[2.4rem]  content-center gap-x-[0.8rem] gap-y-[2.4rem] flex-wrap rounded-[1.2rem]
        `}>
          <div className="bg-white   w-[28rem] h-[12.8rem] p-[2.4rem] rounded-[1.2rem] ">
            <p className="mb-[2.4rem] flex justify-center ">캘린더를 삭제하시겠습니까?</p>
            <div className={`flex justify-center gap-[1.2rem]  ${typographyVariants({ variant: "b1-sb" })}`}>
              <button
                onClick={handleCancelDelete}
                className={`  ${colorVariants({ bg: "gray-100",color:"gray-900" })} text-[1.4rem] rounded-[0.6rem] !w-[11rem] !h-[4rem] py-[1.2rem]  rounded mr-2`}
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`  ${colorVariants({ bg: "red-300", color:"white" })} text-[1.4rem] rounded-[0.6rem] w-[11rem] h-[4rem]  \py-[1.2rem]  text-[var(--white)] `}
              >
                삭제
              </button>
            </div>
          </div>
        </div>
        
      )}
      {/* 계정 관리 */}
      <h2 className={`${typographyVariants({ variant: 'h1-sb' })} text-[2rem] mb-[2.4rem]`}>계정 관리</h2>
      <ul className={`${typographyVariants({ variant: 'b2-md' })} text-[1.4rem] flex  flex-col gap-[1.2rem]`}>
        <li className="flex items-center gap-x-[0.4rem] border-b border-[var(--gray-100)] pb-[0.8rem] cursor-pointer">
          <img src="User.svg" alt="개인정보 수정" size={20} className="text-gray-700" />
          <span className={``}>개인정보 수정</span>
        </li>
        <li 
          onClick={handleLogOutButtonClick}
          className="flex items-center gap-x-[0.4rem] border-b border-[var(--gray-100)] pb-[0.8rem] cursor-pointer">
          <img src="Logout.svg" size={20} alt="" className="text-gray-700" />
          <span className={``}>로그아웃</span>
        </li>
      </ul>
      {showModalLogOut && (
        <div className=
        {` fixed inset-0 flex items-center justify-center z-50 bg-black/25
           ${typographyVariants({ variant: "h2-sb" })}, 
          ${colorVariants({ color: "gray-800" })}, 
          p-[2.4rem]  content-center gap-x-[0.8rem] gap-y-[2.4rem] flex-wrap rounded-[1.2rem]
        `}>
          <div className="bg-white   w-[28rem] h-[12.8rem] p-[2.4rem] rounded-[1.2rem] ">
            <p className="mb-[2.4rem] flex justify-center ">로그아웃하시겠습니까?</p>
            <div className={`flex justify-center gap-[1.2rem]  ${typographyVariants({ variant: "b1-sb" })}`}>
              <button
                onClick={handleLogOut}
                className={`  ${colorVariants({ bg: "gray-100",color:"gray-900" })} text-[1.4rem] rounded-[0.6rem] !w-[11rem] !h-[4rem] py-[1.2rem]  rounded mr-2`}
              >
                아니오
              </button>
              <button
                onClick={handleLogOut}
                className={`  ${colorVariants({ bg: "gray-900", color:"white" })} text-[1.4rem] rounded-[0.6rem] w-[11rem] h-[4rem]  \py-[1.2rem]  text-[var(--white)] `}
              >
                예
              </button>
            </div>
          </div>
        </div>       
      )}
    </div>
    </div>
    </div>
</>
  ) : null;
}

import { ref, watch } from 'vue'

export function usePageTitle(initialTitle = '宁静之声') {
  const pageTitle = ref(initialTitle)
  
  const updateTitle = (newTitle) => {
    pageTitle.value = newTitle
    document.title = newTitle
  }
  
  watch(pageTitle, (newTitle) => {
    document.title = newTitle
  })
  
  return { pageTitle, updateTitle }
}
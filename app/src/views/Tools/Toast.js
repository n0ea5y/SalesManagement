  import { toast } from 'vue3-toastify';
  import 'vue3-toastify/dist/index.css';

  export function insertToast(){
    toast('登録完了', {
      "theme": "colored",
      "type": "success",
      "position": "top-center",
      "transition": "slide",
      "dangerouslyHTMLString": true,
      "hideProgressBar": true,
      "icon": false,
      "autoClose": 1800,
    })
  }

  export function updateToast(){
    toast('更新完了', {
      "theme": "colored",
      "type": "success",
      "position": "top-center",
      "transition": "slide",
      "dangerouslyHTMLString": true,
      "hideProgressBar": true,
      "icon": false,
      "autoClose": 1800,
    })
  }
  export function deleteToast(text = '削除完了'){
    toast(text, {
      "theme": "colored",
      "type": "error",
      "position": "top-center",
      "transition": "slide",
      "dangerouslyHTMLString": true,
      "hideProgressBar": true,
      "icon": false,
      "autoClose": 1800,
    })
  }

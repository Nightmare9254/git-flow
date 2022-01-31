import copyCat from 'copyfiles'
//
 const moveFiles = () => {
  copyCat(
    ['./src/App.vue', './../../../../mnt/'],
    { flat: true, verbose: true, up: 1 },
    () => console.log('Blade works')
  );
};
moveFiles();

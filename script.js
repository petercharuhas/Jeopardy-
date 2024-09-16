$(document).ready(function() {
    const NUM_CATEGORIES = 6;
    const NUM_QUESTIONS_PER_CAT = 5;
  
    let categories = [];
  
    function getRandomCategories(callback) {
      $.ajax({
        url: 'https://rithm-jeopardy.herokuapp.com/api/categories',
        method: 'GET',
        data: { count: 100 },  // Get 100 categories to choose from
        dataType: 'json'
      }).done(function(response) {
        const shuffled = _.shuffle(response);
        callback(shuffled.slice(0, NUM_CATEGORIES));
      }).fail(function(err) {
        console.error("Couldn't get categories", err);
        alert("Failed to load categories. Please try again.");
      });
    }
  
    function getCluesForCategory(categoryId, callback) {
      $.ajax({
        url: `https://rithm-jeopardy.herokuapp.com/api/category`,
        method: 'GET',
        data: { id: categoryId },
        dataType: 'json'
      }).done(function(response) {
        const shuffled = _.shuffle(response.clues);
        callback(shuffled.slice(0, NUM_QUESTIONS_PER_CAT));
      }).fail(function(err) {
        console.error(`Couldn't get clues for category ${categoryId}`, err);
        callback([]);
      });
    }
  
    function fillTable(categories) {
      const $table = $('#jeopardy');
      $table.empty();
  
      const $thead = $('<thead>').appendTo($table);
      const $tr = $('<tr>').appendTo($thead);
  
      categories.forEach(category => {
        $('<th>').text(category.title).appendTo($tr);
      });
  
      const $tbody = $('<tbody>').appendTo($table);
  
      for (let i = 0; i < NUM_QUESTIONS_PER_CAT; i++) {
        const $tr = $('<tr>').appendTo($tbody);
        categories.forEach(category => {
          $('<td>').text('?').data('clue', category.clues[i]).appendTo($tr);
        });
      }
    }
  
    function handleClick(evt) {
      const $td = $(evt.target);
      const clue = $td.data('clue');
  
      if ($td.text() === '?') {
        $td.text(clue.question);
      } else if ($td.text() === clue.question) {
        $td.text(clue.answer);
      }
    }
  
    function setupAndStart() {
      getRandomCategories(function(cats) {
        let categoriesLoaded = 0;
        cats.forEach(category => {
          getCluesForCategory(category.id, function(clues) {
            category.clues = clues;
            categoriesLoaded++;
            if (categoriesLoaded === NUM_CATEGORIES) {
              categories = cats;
              fillTable(categories);
            }
          });
        });
      });
    }
  
    $('#restart').on('click', setupAndStart);
    $('#jeopardy').on('click', 'td', handleClick);
  
    setupAndStart();
  });
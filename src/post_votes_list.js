
(function(){
  
  window.SteemMoreInfo.Events.addEventListener(window, 'voters-list-show', function(e) {
    var votersList = e.state;
    if(!votersList.hasClass('smi-voting-info-shown')){

      var author;
      var permlink;

      var hentry = votersList.closest('.hentry');
      if(hentry.is('article')){
        var url = window.location.pathname;
        var match = url.match(/\/[^\/]*\/@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }else{
        var id = hentry.attr('id');
        var match = id.match(/\#@([^\/]*)\/(.*)$/);
        author = match[1];
        permlink = match[2];
      }
      if(!author || !permlink){
        return;
      }

      votersList.addClass('smi-voting-info-shown');
      var moreButtonLi;
      var voteElsByVoter = {};

      // prevent page scroll if mouse is no top of the list
      votersList.bind('mousewheel DOMMouseScroll', function (e) {
        var delta = e.wheelDelta || (e.originalEvent && e.originalEvent.wheelDelta) || -e.detail,
            bottomOverflow = this.scrollTop + $(this).outerHeight() - this.scrollHeight >= 0,
            topOverflow = this.scrollTop <= 0;

        if ((delta < 0 && bottomOverflow) || (delta > 0 && topOverflow)) {
            e.preventDefault();
        }
      });

      votersList.children().each(function(){
        var li = $(this);
        if(!li.has('a').length){
          moreButtonLi = li;
          return;
        }
        var voteWeigth = $('<span class="vote-weight"></span>');
        var voteDollar = $('<span class="vote-dollar"></span>');
        li.append(voteWeigth);
        li.append(voteDollar);

        var href = li.find('a').attr('href');
        var voter = href.substring(2);

        voteElsByVoter[voter] = voteElsByVoter[voter] || [];
        voteElsByVoter[voter].push(li);
      });

      window.SteemMoreInfo.Utils.getContent(author, permlink, function(err, result){
        if(!result){
          return;
        }
        var newElCount = 0;
        var active_votes = _.sortBy(result.active_votes, function(v){
          return -parseInt(v.rshares);
        });
        _.each(active_votes, function(vote) {
          var voter = vote.voter;
          var voteDollar = vote.voteDollar;
          var votePercent = Math.round(vote.percent / 100);
          if(voteDollar){
            var voteEls = voteElsByVoter[voter] || [];
            if(!voteEls.length){
              var newEl = $('<li>' +
                '<a class="smi-navigate" href="/@' + voter + '">' +
                (votePercent >= 0 ? '+' : '-') + ' ' + voter + 
                '</a>' +
                '<span class="vote-weight"></span>' +
                '<span class="vote-dollar"></span>' +
                '</li>');
              votersList.append(newEl);
              newElCount++;
              voteEls.push(newEl);
            }
            _.each(voteEls, function(voteEl) {
              voteEl.find('.vote-weight').text(votePercent + '%');
              voteEl.find('.vote-dollar').text('≈ ' + voteDollar + '$');
            });
          }
        });
        if(newElCount && moreButtonLi){
          moreButtonLi.remove();
        }
      });

    }
  });


})();
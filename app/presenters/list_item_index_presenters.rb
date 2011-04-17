module ListItemIndexPresenters

  class Dashboard
    def initialize( user_id )
      @user_id = user_id
    end

    def template
      @template = 'list_items-list_item_dashboard'
    end

    def last_updated_utc
      last_updated_item = ListItem.all_scheduled( @user_id ).order( 'lists.updated_at desc' ).first
      @last_updated_utc = unless last_updated_item.nil?
        last_updated_item.list.updated_at.utc
      else
        Time.now.utc
      end
    end

    def json
      data.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date ])
    end

    private

    def data
      ListItem.all_scheduled_uncompleted( @user_id )
    end
  end

  class ListItemView
    def initialize( user_id, list_id, list_filter)
      @user_id = user_id
      @list_id = list_id
      @filter = list_filter

      case @filter
      when "all" # all of a specific list
        @data = ListItem.all_list( @user_id, @list_id )
      when "completed" # all completed of a specific list
        @data = ListItem.all_list_completed( @user_id, @list_id )
      else # all uncompleted of a specific list
        @data = ListItem.all_list_uncompleted( @user_id, @list_id )
      end
    end

    def template
      @template = 'list_items-list_item'
    end

    def data
      @data
    end

    def last_updated_utc
      last_updated_item = @data.first
      unless last_updated_item.nil?
        last_updated_item.list.updated_at.utc
      else
        Time.now.utc
      end
    end

    def json
      self.data.to_json( :include => :list,
        :methods => [ :deadline_category, :deadline_in_words, :body_shortend, :deadline_date, :body_word_count ],
        :except => [ :body ] )
    end
  end

end
class ListItem < ActiveRecord::Base
  # ASSOCIATIONS

  belongs_to :list

  # for now not supporting this, because I'm not yet pursuated that
  # this feature is really needed. simple todo lists are more likely
  # to be actually used.
  # keeping the parent_id field in the DB for now, might drop that later.
  #belongs_to :parent_item, :class_name => 'ListItem'
  #has_many :children_items, :class_name => 'ListItem', :foreign_key => 'parent_item_id', :dependent => :destroy

  # SCOPES

  scope( :all_scheduled_uncompleted, lambda { |user_id|
    joins( :list ).
    includes( :list ).
    where( "list_items.deadline > ?", Time.zone.now.yesterday.end_of_day).
    where( "lists.owner_id=? AND list_items.completed=? AND not list_items.deadline is ?", user_id, false, nil).
    order( "list_items.deadline asc" )
  })

  scope( :all_list, lambda { |user_id, list_id|
    joins( :list ).
    where( "lists.owner_id=? AND list_id=?", user_id, list_id ).
    order( "list_items.created_at desc" )
  })

  scope( :all_list_completed, lambda { |user_id, list_id|
    all_list( user_id, list_id ).where( "completed=?", true )
  })

  scope( :all_list_uncompleted, lambda { |user_id, list_id|
    all_list( user_id, list_id ).where( "completed=?", false )
  })

  # VALIDATIONS
  validates_presence_of :list

  attr_accessible :body, :completed, :deadline

  # public functions

  def saved?
    !self.id.nil?
  end

  def body_rendered
    unless self.body.nil?
      get_body_html self.body.length
    end
  end

  def body_shortend
    get_body_html 60
  end

  def deadline_in_words
    get_deadline_category
  end

  def deadline_category
    get_deadline_category
  end

  def deadline_date
    if self.deadline.nil?
      ''
    else
      self.deadline.strftime('%Y-%m-%d')
    end
  end

  private

  def get_body_html( length )
    unless self.body.nil?
      regex_url = /(\s|>)((https?|ftp):(\/\/)+([\w\d:\/\#@%;$()~_?\+-=\\\&][^<]*))(\s|<)/
      regex_links = /((<a)(.)*(\/a>))/

      # generate HTML from textile
      html = RedCloth.new( self.body[ 0..length ] ).to_html
      html_without_links = String.new( html )

      # remove all existing links from the html:
      matched_link = html_without_links.scan( regex_links ).collect { |match| match.first }
      matched_link.uniq!
      matched_link.each do |match|
        html_without_links.gsub!(match, '')
      end

      # match URLs and replace them with real links
      matches = html_without_links.scan( regex_url ).collect{ |match| match.second }
      matches.uniq!
      matches.each do |match|
        html.gsub!(match, %Q-<a href="#{match}" target="_blank">#{match}</a>-)
      end

      if length < self.body.length
        html << "<span class=""dashboard-item-more"">[#{ self.body.length - length } characters more]</span>"
      end


      html
    end
  end

  def get_deadline_category
    cat = ''

    case self.deadline
    when Time.zone.now.beginning_of_day...Time.zone.now.end_of_day
      cat = 'today'
    when Time.zone.now.tomorrow.beginning_of_day...Time.zone.now.tomorrow.end_of_day
      cat = 'tomorrow'
    when (Time.zone.now + 1.week).beginning_of_week...(Time.zone.now + 1.week).end_of_week
      cat = 'next week'
    else
      cat = self.deadline.nil? ? 'whenever' : self.deadline.strftime('%Y-%m-%d')
    end

    cat
  end
end

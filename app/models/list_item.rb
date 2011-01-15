class ListItem < ActiveRecord::Base
  # ASSOCIATIONS

  belongs_to :list

  # for now not supporting this, because I'm not yet pursuated that
  # this feature is really needed. simple todo lists are more likely
  # to be actually used.
  # keeping the parent_id field in the DB for now, might drop that later.
  #belongs_to :parent_item, :class_name => 'ListItem'
  #has_many :children_items, :class_name => 'ListItem', :foreign_key => 'parent_item_id', :dependent => :destroy

  # VALIDATIONS

  validates_presence_of :list

  # CALLBACKS
  after_initialize :init_body_rendered, :init_deadline_in_words

  attr_accessible :body, :completed, :deadline

  # public functions

  def saved?
    !self.id.nil?
  end

  private

  def init_body_rendered

    unless self.body.nil?
      regex_url = /(\s|>)((https?|ftp):(\/\/)+([\w\d:\/\#@%;$()~_?\+-=\\\&][^<]*))(\s|<)/
      regex_links = /((<a)(.)*(\/a>))/

      # generate HTML from textile
      html = RedCloth.new( self.body ).to_html
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

      write_attribute( :body_rendered, html )
    end
  end

  def init_deadline_in_words
    word = ''

    case self.deadline
    when Time.zone.now.tomorrow.beginning_of_day..Time.zone.now.tomorrow.end_of_day
      word = 'tomorrow'
    when (Time.zone.now + 1.week).beginning_of_week..(Time.zone.now + 1.week).end_of_week
      word = 'next week'
    else
      word = self.deadline.nil? ? 'whenever' : self.deadline.strftime('%Y-%m-%d')
    end

    write_attribute( :deadline_in_words, word)
  end
end

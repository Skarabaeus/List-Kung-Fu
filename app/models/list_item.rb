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
  after_initialize :body_rendered

  attr_accessible :body, :completed

  # public functions

  def saved?
    !self.id.nil?
  end

  def stefan
    0
  end


  private

  def body_rendered

    unless self.body.nil?
      # matches URLs
      regex = /(\s|>)((https?|ftp):(\/\/)+([\w\d:\/\#@%;$()~_?\+-=\\\&][^<]*))(\s|<)/

      # generate HTML from textile
      html = RedCloth.new( self.body ).to_html

      # match URLs
      matches = html.scan(regex).collect{ |match| match.second }
      matches.uniq!

      matches.each do |match|
        html.gsub!(match, %Q-<a href="#{match}" target="_blank">#{match}</a>-)
      end


      write_attribute( :body_rendered, html )
    end
  end
end
